/*
Component to allow viewing and editing of the metadat associated with a file.
Indendet to be used in a Sidebar next
  - to a file
  - to a folder, to allow mass editing of childs metadata by directory structure.
*/
import React, { useEffect, useState } from 'react'
import { MdExpandMore, MdExpandLess, MdAdd, MdClear, MdKeyboardReturn } from 'react-icons/md'
import { Button, TightInputForm, DeleteIcon } from '@archipel/ui'
import MetadataLink from './MetadataLink'
import { EditorController } from './editorController'
import { makeLink } from '@archipel/common/util/triples'
import { useMetadata } from './editorStore'
import { getArchive } from '../archive/archive'
import { Categories } from './schemas'
import { EditMetadataOverlay } from './EditSubmetadataOverlay'

/*
Category
*/

function ShowAndSetCategory (props) {
  const { controller } = props
  const [category, setCategory] = useState(controller.category())
  const [expanded, setExpand] = useState(false)

  const ExpandIcon = expanded ? MdExpandLess : MdExpandMore
  return (
    <div className='bg-grey-lighter flex-none p-1'>
      <div className='inline-flex cursor-pointer' onClick={onExpand}>
        <span className='flex-none font-bold mr-2'>Category: </span>
        <span className='flex-1'>{Categories.getLabel(category)}</span>
        <div className='w-4 h-4 flex-0'>
          <ExpandIcon />
        </div>
      </div>
      {expanded && <ul className='list-reset pl-4'>
        {Categories.getLabel(-1).map(
          (label) => <li className='p-1 cursor-pointer'
            key={label}
            onClick={() => asyncSetCategory(
              Categories.getID(label))}>
            {label}
          </li>
        )}
      </ul>}
    </div>
  )

  async function asyncSetCategory (category) {
    await controller.setCategory(category)
    setCategory(controller.category())
  }

  function onExpand (e) {
    e.stopPropagation()
    setExpand(state => !state)
  }
}

/*
Metadata List
*/

export function ListAndEditMetadata (props) {
  const { metadata } = props
  const { ofCategory: category, ...rest } = metadata

  let keyIndex = 0
  if (typeof rest !== 'object') return rest

  return (
    <ul className='list-reset'>
      {Object.keys(rest).map(
        (entryKey) => <MetadataListEntry
          key={`${entryKey}+${keyIndex++}`}
          entryKey={entryKey}
          metadataEntry={metadata[entryKey]}
          {...props}
        />
      )}
    </ul>
  )
}

function MetadataListEntry (props) {
  const { metadataEntry, setDraftValue } = props
  let { values } = metadataEntry

  return (
    <li className='flex flex-col mb-1 mt-1'>
      <span className='font-bold'>{`${metadataEntry.label}:`}</span>
      { values &&
        <ul className='list-reset mx-2'>
          {Object.keys(values).map((itemKey) =>
            <MetadataListEntryItem
              key={`value${values[itemKey].value}state${values[itemKey].state}`}
              value={values[itemKey]}
              {...props} />)}
        </ul>
      }
      { setDraftValue &&
      <InputMetadataEntry className='pl-2 self-stretch'
        {...props} /> }
    </li>
  )
}

function MetadataListEntryItem (props) {
  let { value, setDeleteValue, entryKey, metadataEntry } = props
  let { type: valueType } = metadataEntry

  let Submeta = null
  if (valueType) {
    for (let key of Object.keys(valueType.definitions)) {
      if (valueType.definitions[key].type && valueType.definitions[key].type._schema) {
        Submeta = <EditMetadataOverlay
          archive={props.archive}
          type={valueType.definitions[key].type.name}
          literal={value.value} />
      }
    }
  }

  if (value.state === 'actual') {
    return <li className='inline-flex items-start p-1 m-1 bg-grey-lighter rounded'>
      <span className='flex-1 mr-1'>{Submeta || value.value}</span>
      <DeleteButton />
    </li>
  }
  if (value.state === 'delete') {
    return <li className='inline-flex items-start p-1 m-1 bg-red-lighter rounded line-through'>
      <span className='flex-1'>{value.value}</span>
    </li>
  }
  if (value.state === 'draft') {
    return <li className='inline-flex items-start p-1 m-1 bg-green-lighter rounded'>
      <span className='flex-1 mr-1'>{value.value}</span>
      <DeleteButton />
    </li>
  }
  return <span className='flex-1 items-start truncate'>{JSON.stringify(value)}</span>

  function DeleteButton (props) {
    // return <button onClick={() => setDeleteValue(entryKey, value.value)}>{<MdClear size={14} className='text-red-light border border-red-light rounded-full' />}</button>
    return <DeleteIcon size={14} onClick={() => setDeleteValue(entryKey, value.value)} />
  }
}

function InputMetadataEntry (props) {
  let { entryKey, metadataEntry } = props
  let { singleType, type: valueType } = metadataEntry

  if (valueType) {
    valueType = valueType.definitions[0].type.name ? valueType.definitions[0].type.name.toLowerCase() : 'string'
  } else {
    valueType = 'string'
  }

  let [draftValue, setDraftValue] = useState(metadataEntry.toBeValue)
  useEffect(() => {
    setDraftValue(props.draftValue)
  }, [props])

  const handleKeyPress = function (e) {
    if (e.keyCode === 27) setDraftValue('')
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress.bind(this), false)
    return document.removeEventListener('keydown', handleKeyPress.bind(this), false)
  }, [])

  return (
    <TightInputForm
      type={valueType}
      onChange={e => setDraftValue(e.target.value)}
      value={draftValue || ''}
      onSubmit={() => props.setDraftValue(entryKey, draftValue)}
      buttonSize={20}
      addForm={!singleType} />
    // <form className='inline-flex items-center w-auto'>
    //   <input className='flex-1 ml-1 p-1 border border-solid border-grey rounded'
    //     type={valueType}
    //     onChange={(e) => setDraftValue(e.target.value)}
    //     value={draftValue || ''} />
    //   <button type='submit' onClick={() => props.setDraftValue(entryKey, draftValue)}>
    //     {singleType
    //       ? <MdKeyboardReturn className='ml-1' size={20} />
    //       : <MdAdd className='ml-1' size={20} />
    //     }
    //   </button>
    // </form>
  )
}

/*
Parent
*/

let controller = null

export function MetadataEditor (props) {
  console.log('ME called with', props)
  let { ID } = props

  useEffect(() => {
    controller = new EditorController({ ...props })

    // Feature or Anti-Feature?:
    return () => controller.writeChanges({ onUnmount: true })
  }, [])

  const metadata = useMetadata(ID)

  if (isObjectEmpty(metadata)) return <span>loading...</span>

  return (
    <div className='flex flex-col'>
      <div className='mb-2'>
        <ShowAndSetCategory controller={controller} />
      </div>
      <div className='pl-2 mb-2'>
        {<ListAndEditMetadata
          metadata={metadata}
          archive={props.archive}
          setDraftValue={controller.setDraftValue.bind(controller)}
          setDeleteValue={controller.setDeleteValue.bind(controller)} />}
      </div>
      <Button onClick={() => controller.writeChanges()}>Save</Button>
    </div>
  )
}

export function FileMetadataEditor (props) {
  if (props.stat.isDirectory) return null
  let archive = getArchive(props.archive)

  if (!archive || !archive.structures) return null
  let ID = makeLink(archive.structures[0].discoveryKey, props.path)

  return <MetadataEditor {...props.stat} archive={props.archive} ID={ID} />
}

function isObjectEmpty (object) {
  if (typeof object !== 'object') return false
  if (Object.keys(object).length === 0) return true
  return false
}

/*
Component to allow viewing and editing of the metadat associated with a file.
Indendet to be used in a Sidebar next
  - to a file
  - to a folder, to allow mass editing of childs metadata by directory structure.
*/
import React, { useEffect, useState } from 'react'
import { MdExpandMore, MdExpandLess } from 'react-icons/md'
import { Button } from '@archipel/ui'
import MetadataLink from './MetadataLink'
import { FileMetadataController } from './controller'
import { makeLink, parseLink } from '@archipel/common/util/triples'
import { useMetadata } from './store'
import { getArchive } from '../archive/archive'
import { Categories } from './schemas'

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

function ListAndEditMetadata (props) {
  const { metadata, setToBeValue } = props
  let keyIndex = 0
  if (typeof metadata !== 'object') return metadata
  return <ul className='list-reset'>
    { Object.keys(metadata).map(
      (entryKey) => <MetadataListEntry
        key={`${entryKey}+${keyIndex++}`}
        entryKey={entryKey}
        metadataEntry={metadata[entryKey]}
        setToBeValue={setToBeValue} />
    )}
  </ul>
}

function MetadataListEntry (props) {
  const { entryKey, metadataEntry, setToBeValue } = props
  if (!metadataEntry.actualValue) metadataEntry.actualValue = ['']
  return <li className='flex flex-col mb-1 mt-1'>
    <span className='font-bold'>{`${metadataEntry.label}:`}</span>
    <ul className='list-reset mx-2'>{metadataEntry.actualValue.map((item) => <li key={`actualValue${item}`}>{item}</li>)}</ul>
    <div className='pl-2'>
      <Input entryKey={entryKey}
        toBeValue={metadataEntry.toBeValue}
        valueType={metadataEntry.type}
        setToBeValue={setToBeValue} />
    </div>
  </li>
}

function Input (props) {
  console.log('Input for', props.entryKey, props)
  // let { entryKey, valueType, toBeValue, setToBeValue } = props
  let { entryKey, valueType } = props

  // TODO: valueType.definitions can point to a schema by itself. Implement support!
  valueType = valueType.definitions[0].type.name ? valueType.definitions[0].type.name.toLowerCase() : 'string'

  let [toBeValue, setToBeValue] = useState(props.toBeValue)
  useEffect(() => {
    setToBeValue(props.toBeValue)
  }, [props])

  return (
    <div className='inline-flex'>
      <input className='p-1 border border-solid border-grey rounded'
        type={valueType}
        onChange={(e) => setToBeValue(e.target.value)}
        onBlur={() => props.setToBeValue(entryKey, toBeValue)}
        value={toBeValue || ''} />
      {/* <button onClick={() => setToBeValue(entryKey, toBeValue)}>1</button> */}
    </div>
  )
}

let controller = null

export function MetadataEditor (props) {
  if (props.stat.isDirectory) return null
  let archive = getArchive(props.archive)

  if (!archive || !archive.structures) return null
  let fileID = makeLink(archive.structures[0].discoveryKey, props.path)

  useEffect(() => {
    controller = new FileMetadataController({ ...props.stat, fileID })

    return () => controller.writeChanges({ onUnmount: true })
  }, [])

  const metadata = useMetadata(fileID)

  if (isObjectEmpty(metadata)) return <span>loading...</span>
  return (
    <div className='flex flex-col'>
      <div className='mb-2'>
        <ShowAndSetCategory controller={controller} />
      </div>
      <div className='pl-2 mb-2'>
        { <ListAndEditMetadata
          metadata={metadata}
          setToBeValue={controller.setToBeValue.bind(controller)} /> }
      </div>
      { // Ad-hoc solution to allow the onBlur()
      }
      <Button onClick={() => setTimeout(() => controller.writeChanges(), 100)}>Save</Button>
    </div>
  )
}

function isObjectEmpty (object) {
  if (typeof object !== 'object') return false
  if (Object.keys(object).length === 0) return true
  return false
}

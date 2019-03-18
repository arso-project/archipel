/*
Component to allow viewing and editing of the metadat associated with a file.
Indendet to be used in a Sidebar next
  - to a file
  - to a folder, to allow mass editing of childs metadata by directory structure.
*/
import React, { useEffect } from 'react'
import MetadataLink from './MetadataLink'
import { FileMetadataController } from './controller'
import { makeLink, parseLink } from '@archipel/common/util/triples'
import { useMetadata } from './store'
import { getArchive } from '../archive/archive'

function ListAndEditMetadata (props) {
  const { metadata, setToBeValue } = props
  let keyIndex = 0
  if (typeof metadata !== 'object') return metadata
  return <ul className='list-reset'>
    { Object.keys(metadata).map(
      (entryKey) => <MetadataListEntry key={`${entryKey}+${keyIndex++}`} entryKey={entryKey} metadataEntry={metadata[entryKey]} setToBeValue={setToBeValue} />
    )}
  </ul>
}

// function metadataEntryToListEntry (entryKey, metadataEntry) {
//   console.log('metadatEntry...:', entryKey, metadataEntry)
//   // if (!metadataEntry.type) {
//   // }
//   switch (metadataEntry.type) {
//     case 'string':
//       return <MetadataListEntry entryKey={entryKey}
//         label={metadataEntry.label}
//         actualValue={metadataEntry.actualValue || null}
//         Input={<InputText />}
//       />
//     case 'date':
//       return <MetadataListEntry entryKey={entryKey}
//         label={metadataEntry.label}
//         actualValue={metadataEntry.actualValue || null}
//         Input={<InputDate />}
//       />
//     default:
//       return <MetadataListEntry key={entryKey}
//         label={metadataEntry.label}
//         actualValue={metadataEntry.actualValue || null}
//         Input={<InputDate />}
//       />
//   }
// }

function MetadataListEntry (props) {
  const { entryKey, metadataEntry, setToBeValue } = props
  return <li >
    <div className='flex flex-col'>
      <span>{`${metadataEntry.label}:`}</span>
      <span className='pl-2'>{metadataEntry.actualValue}</span>
      <div className='pl-2'><Input entryKey={entryKey} toBeValue={metadataEntry.toBeValue} valueType={metadataEntry.type} setToBeValue={setToBeValue} /></div>
    </div>
  </li>
}

function Input (props) {
  console.log('Input for', props.entryKey, props)
  let { entryKey, toBeValue, valueType, setToBeValue } = props
  return <div className='inline-flex'>
    <input type={valueType} onChange={(e) => { toBeValue = e.target.value }} />
    <button onClick={() => setToBeValue(entryKey, toBeValue)}>1</button>
  </div>
}

// function InputDate (props) {
//   return <div>
//     <input type='date' />
//   </div>
// }
// export const MetadataEditor = MetadataEditorWithApi
// let thisfilemetadatacontroller = null
// function initfilemetadatacontroller (props) {
//   if (thisfilemetadatacontroller) return thisfilemetadatacontroller
//   thisfilemetadatacontroller = new filemetadatacontroller(props)
//   return thisfilemetadatacontroller
// }

let controller = null

export function MetadataEditor (props) {
  if (props.stat.isDirectory) return null
  let archive = getArchive(props.archive)

  if (!archive || !archive.structures) return null
  let fileID = makeLink(archive.structures[0].discoveryKey, props.path)

  useEffect(() => {
    console.log('useEffect called')
    controller = new FileMetadataController({ ...props.stat, fileID })

    return () => controller.writeChanges({ onUnmount: true })
  }, [])

  const metadata = useMetadata(fileID)
  console.log(metadata)
  // console.log('reached')
  if (isObjectEmpty(metadata)) return <span>loading...</span>
  return (
    <div className='flex flex-col'>
      <span>{fileID}</span>
      <span>{controller.category()}</span>
      <button onClick={() => controller.howSchema()}>Schema</button>
      <h6>Metadata</h6>
      <div>{ <ListAndEditMetadata metadata={metadata} setToBeValue={controller.setToBeValue.bind(controller)} /> }</div>
      <button onClick={() => controller.writeChanges()}>Save</button>
    </div>
  )
}

function isObjectEmpty (object) {
  if (typeof object !== 'object') return false
  if (Object.keys(object).length === 0) return true
  return false
}

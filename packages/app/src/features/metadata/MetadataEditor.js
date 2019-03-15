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
import { useActualMetadata, useToBeMetadata, fileid } from './store'
import { getArchive } from '../archive/archive'
import { isObject } from 'util';

class MetadataEditorWithApi extends React.Component {
  constructor (props) {
    super(props)
    this.controller = null
    this.fileid = makeLink(this.props.stat.key, this.props.stat.path)
    // this.state = {
    //   metadata: null,
    // }
    this.metadata = {}
    // this.console = setInterval(() => console.log('Editor State:', this.state), 1000)
  }

  async componentDidMount () {
    // console.log('MetadataEditor', this.props)
    if (!this.props.path || !this.props.archive) throw new Error('no file specified')
    this.controller = new FileMetadataController(this.props.stat)
    // let metadata = await this.controller.init()
    // this.setState({ metadata })
    this.metadata.actualMetadata = useActualMetadata(this.fileid)
    this.metadata.toBeMetadata = useToBeMetadata(this.fileid)
    this.controller.getMetadata()
    // let metadata = await getMetadata(
    //   this.props.archive,
    //   { subject: this.props.path })
    // let metadata = await this.controller.getMetadata()
    // console.log('MetadataEditor', metadata)
    // let schema = await this.controller.getSchema()
    // let category = await this.controller.getCategory()
    // console.log(schema, category, metadata)
    // this.setState({ metadata })
  }

  componentWillUnmount () {
    clearInterval(this.console)
    this.setState(null)
  }

  render () {
    if (!this.metadata) return <span>loading...</span>
    let { asIsMetadata, asWillBeMetadata } = this.metadata

    return (
      <div className='flex flex-col'>
        <button onClick={() => this.controller.howSchema()}>Schema</button>
        <h6>As is Metadata</h6>
        <span>{ ListFromArray(asIsMetadata) }</span>
        <h6>As will be Metadata</h6>
        <span>{ ListFromArray(asWillBeMetadata) }</span>
      </div>
    )
  }
}

function ListFromArray (array) {
  if (typeof array !== 'object') return array
  if (!array.length) return JSON.stringify(array)
  return <ul>
    { array.map(e => { return <li key={JSON.stringify(e)}>{ JSON.stringify(e) }</li> }) }
  </ul>
}

function EditEntriesList (props) {
  const { metadata } = props
  if (typeof metadata !== 'object') return metadata
  return <ul>
    { Object.keys(metadata).map(
      (entryKey) => metadataEntryToListEntry(entryKey, metadata[entryKey])
    )}
  </ul>
}

function metadataEntryToListEntry (entryKey, metadataEntry) {
  console.log('metadatEntry...:', entryKey, metadataEntry)
  if (!metadataEntry.type) {
    return <MetadataListEntry key={entryKey}
      label={metadataEntry.label}
      // Input={<InputDate />} 
    />
  }
  switch (metadataEntry.type) {
    case 'String':
      return <MetadataListEntry entryKey={entryKey}
        label={metadataEntry.label}
        // Input={<InputText />} 
      />
    case 'Date':
      return <MetadataListEntry entryKey={entryKey}
        label={metadataEntry.label}
        // Input={<InputDate />} 
      />
  }
}

function MetadataListEntry (props) {
  const { entryKey, label, Input } = props
  return <li key={entryKey}>
    <div className='inline-flex'>
      <span>{`${label}:`}</span>
      {/* <Input /> */}
    </div>
  </li>
}

function InputText (props) {
  return <div>
    <input type='text' />
  </div>
}
function InputDate (props) {
  return <div>
    <input type='date' />
  </div>
}
// export const MetadataEditor = MetadataEditorWithApi
// let thisfilemetadatacontroller = null
// function initfilemetadatacontroller (props) {
//   if (thisfilemetadatacontroller) return thisfilemetadatacontroller
//   thisfilemetadatacontroller = new filemetadatacontroller(props)
//   return thisfilemetadatacontroller
// }
let controller = null
let count = 1
export function MetadataEditor (props) {
  if (props.stat.isDirectory) return null
  let archive = getArchive(props.archive)
  
  if (!archive && !archive.structures) return null
  let fileID = makeLink(archive.structures[0].discoveryKey, props.path)

  useEffect(() => {
    console.log('useEffect called')
    controller = new FileMetadataController({ ...props.stat, fileID, count })
    count++
  }, [props])

  const actualMetadata = useActualMetadata(fileID)
  const toBeMetadata = useToBeMetadata(fileID)
  console.log(actualMetadata)
  console.log(toBeMetadata)
  // console.log('reached')
  if (isObjectEmpty(actualMetadata) || isObjectEmpty(toBeMetadata)) return <span>loading...</span>
  // console.log('reached')
  return (
    <div className='flex flex-col'>
      <span>{fileID}</span>
      <button onClick={() => controller.howSchema()}>Schema</button>
      <h6>Actual Metadata</h6>
      <div>{ <EditEntriesList metadata={actualMetadata} /> }</div>
      <h6>To be Metadata</h6>
      <div>{ <EditEntriesList metadata={toBeMetadata} /> }</div>
    </div>
  )
}

function isObjectEmpty (object) {
  if (typeof object !== 'object') return false
  if (Object.keys(object).length === 0) return true
  return false
}

/*
export async function MetadataEditor (props) {
  if (!props.path || !props.archive) throw new Error('no file specified')
  let fileID = makeLink(props.stat.key, props.stat.path)
  // let log = setInterval(() => console.log('Editor State:', this.state), 1000)
  console.log('MetadataEditor', props)
  const controller = new FileMetadataController(props.stat)
  console.log('check')
  await controller.init()
  console.log('check')
  await controller.getMetadata()
  console.log('check')
  const actualMetadata = useActualMetadata(fileID)
  console.log('check')
  const toBeMetadata = useToBeMetadata(fileID)
  console.log('check')
  console.log('MetadataEditor:', actualMetadata, toBeMetadata)
  if (!actualMetadata || !toBeMetadata) return <span>loading...</span>
  return (
    <div className='flex flex-col'>
      <button onClick={() => controller.howSchema()}>Schema</button>
      <h6>As is Metadata</h6>
      <span>{ ListFromArray(actualMetadata) }</span>
      <h6>As will be Metadata</h6>
      <span>{ ListFromArray(toBeMetadata) }</span>
    </div>
  )
}
*/

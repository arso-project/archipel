import React from 'react'
import PropTypes from 'prop-types'

import fileReader from 'filereader-stream'
import pretty from 'pretty-bytes'
import speedometer from 'speedometer'
import through from 'through2'
import pump from 'pump'

import { Button, Heading, List } from '@archipel/ui'

import { withApi } from '../../lib/api.js'

function updateAt (arr, i, put) {
  return arr.map((item, j) => j === i ? Object.assign({}, item, put) : item)
}

const FileListItem = (file) => {
  let { name, size, pending, done, written, speed } = file
  let status = 'Waiting'
  if (pending) status = 'Uploading'
  if (done) status = 'Done'
  let percent = written ? Math.round((written / size) * 100) : 0
  size = pretty(size)
  written = pretty(written)
  speed = pretty(speed)
  return (
    <div className='flex'>
      <div className='w-1/2 flex-none truncate'><strong>{name}</strong><br />{size}</div>
      <div className='w-1/4 flex-none text-sm'>
        <em>{status}</em><br />
        <span className='text-blue'>{percent}%</span>
      </div>
      <div className='w-1/4 flex-none text-sm'>
        <span className='text-blue'>{speed}/s</span><br />
        <span className='text-green'>{written}</span>
      </div>
    </div>
  )
}

class UploadFile extends React.Component {
  constructor (props) {
    super()
    this.uploadRef = React.createRef()
    this.state = {
      pending: false,
      result: null,
      status: [],
      files: [],
      uploadDir: false
    }
    this.onUpload = this.onUpload.bind(this)
    this.onChange = this.onChange.bind(this)
    this.setUploadDir = this.setUploadDir.bind(this)
  }

  async setUploadDir (e) {
    this.setState({ uploadDir: e.target.checked })
  }

  async onChange (e) {
    const fileList = e.target.files
    const files = []
    let name
    for (let i = 0; i < fileList.length; i++) {
      if (this.state.uploadDir) {
        name = fileList[i].webkitRelativePath
      } else {
        name = fileList[i].name
      }
      files.push({
        idx: i,
        name: name,
        size: fileList[i].size,
        pending: false,
        done: false,
        written: 0,
        speed: 0
      })
    }
    this.setState({ files })
  }

  async onUpload () {
    if (this.uploadRef.current.files.length) {
      this.setState({ pending: true })
      const fileList = this.uploadRef.current.files
      const files = []
      for (let i = 0; i < fileList.length; i++) {
        files.push(fileList[i])
      }
      // const uploads = files.map((file, i) => this.uploadFile(file, i))
      // console.log('uploads', uploads)
      // Promise.all(uploads)
      //   .then(() => this.setState({ pending: false }))
      //   .catch(e => this.setState({ error: e }))

      this.seqRunUploads(files).then(
        this.setState({ pending: false, done: true })
      )
    }
  }

  async seqRunUploads (files) {
    for (let i = 0; i < files.length; i++) {
      try {
        await this.uploadFile(files[i], i)
      } catch (e) {
        this.setState({ error: e })
        break
      }
    }
  }

  async uploadFile (file, i) {
    const updateState = newState => this.setState(state => (
      { files: updateAt(state.files, i, newState) }
    ))

    updateState({ pending: true })

    let { path, api, archive } = this.props
    const key = archive

    let { name, webkitRelativePath } = file
    if (this.state.uploadDir) name = webkitRelativePath

    path = (path === '/' ? '' : path) + '/' + name
    const speedo = speedometer()
    let speed = 0
    let written = 0

    // Set up a passthrough stream to track stats.
    const passthrough = through(function (chunk, enc, next) {
      written += chunk.length
      speed = speedo(chunk.length)
      this.push(chunk)
      next()
    })

    // The actual streaming file reader.
    const reader = fileReader(file)

    // The write stream to the backend.
    const ws = await api.hyperdrive.createWriteStream(key, path)

    // Pump it all toghether.
    pump(reader, passthrough, ws)

    // Update the state every 200ms.
    const update = () => updateState({ written, speed })
    const debounce = setInterval(update, 200)

    // Cleanup when done.
    ws.on('finish', () => {
      clearInterval(debounce)
      updateState({ pending: false, done: true, written, speed })
    })

    // todo: is this clean enough?
    // core.getStore('fs').fetchStats({ archive: key, path: this.props.path})
  }

  render () {
    const { path, archive } = this.props
    return (
      <>
        <Heading className='text-pink'>Upload file</Heading>
        {path !== '/' && <div className='mb-2'>Parent folder: <strong>{path}</strong></div>}
        <div className='p-4 bg-grey-lighter '>
          <div className='flex mb-4'>
            <input type='checkbox' name='uploadDir' onChange={this.setUploadDir} />
            <label htmlFor='uploadDir'>Upload Directory</label>
          </div>
          { this.state.uploadDir ?
            <div className='flex mb-2'>
              <input type='file' webkitdirectory='foo' multiple
                onChange={this.onChange} ref={this.uploadRef} />
            </div> :
            <div className='flex mb-2'>
              <input type='file' multiple
                onChange={this.onChange} ref={this.uploadRef} />
            </div> }
          <Button onClick={this.onUpload}>Upload</Button>
        </div>
        <div className='pt-1'>
          { this.state.pending && <em>Status: Uploading...</em> }
          { this.state.done && <em>Status: Done.</em> }
          { this.state.res && <strong>Status: { this.state.res }</strong>}
          <List items={this.state.files} renderItem={(file) => FileListItem(file)} />
        </div>
      </>
    )
  }
}

UploadFile.propTypes = {
  archive: PropTypes.string,
  path: PropTypes.string
}

export default withApi(UploadFile)


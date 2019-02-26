import React from 'react'
import { Heading, Button } from '@archipel/ui'
import pretty from 'pretty-bytes'

import { registerRoute, registerElement } from '@archipel/app/src/lib/router'
import { useFile } from '@archipel/app/src/features/drive/file'

registerRoute(
  'archive/:archive/youtube',
  (props) => <YoutubeImportScreen {...props} />,
  { wrap: true }
)

registerElement('archive/:archive', {
  link: { name: 'Youtube', href: 'archive/:archive/youtube', weight: 8 }
})

registerElement({
  route: 'archive/:archive/files/*',
  panel: { name: 'youtube', YoutubePanel },
  action: { name: 'youtube', YoutubeImportAction }
})

function YoutubeImportAction (props) {
  const { params, context } = useRouter()
  if (context.file && context.file.isDirectory) {
    return <ActionLink onClick={e => alert('go!')}>Import from youtube!</ActionLink>
  }
  return null
}

function ActionLink (props) {
  return (
    <a {...props} className={cls}>{children}</a>
  )
}

function YoutubePanel () {
  return <em>Hi!</em>
}

export default {
  name: 'import-youtube',
  plugin
}

async function plugin (core) {
  core.components.add('archiveTabs', wrapper(core, YoutubeImportScreen), { title: 'Youtube' })
  core.components.add('fileViewer', Player, {
    stream: true,
    match: (file) => {
      return file.mimetype && file.mimetype.match(/video\/.*/)
    }
  })
}

function wrapper (core, Component) {
  return (props) => <Component {...props} core={core} />
}

class YoutubeImportScreen extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      link: '',
      valid: false,
      status: {
        name: '',
        written: 0,
        size: 0,
        speed: 0,
        step: 'waiting',
        error: false
      }
    }
    this.onChange = this.onChange.bind(this)
    this.startImport = this.startImport.bind(this)
    this.core = this.props.core
  }

  onChange (e) {
    let valid = false
    if (e.target.value.match(/^https?:\/\/(www.)?youtube.com\/.*$/)) valid = true
    this.setState({ link: e.target.value, valid })
  }

  async startImport () {
    let res = await this.core.rpc.request('import/youtube', {
      link: this.state.link,
      key: this.props.archive
    })
    res.stream.on('data', (status) => {
      this.setState({ status: Object.assign({}, this.state.status, status) })
    })
  }

  render () {
    let color = this.state.valid ? 'border-2 border-green' : 'border-2 border-red'
    return (
      <div className='p-4'>
        <Heading>Import from youtube</Heading>
        <div className='p-4'>
          <input className={color} type='text' value={this.state.link} onChange={this.onChange} />
          <Button onClick={this.startImport}>Import</Button>
        </div>
        <div className='bg-yellow-lighter m-4 p-4 border-blue border-2'>
          <Speed status={this.state.status} />
        </div>
      </div>
    )
  }
}

const Speed = ({ status }) => {
  let { name, step, size, written, speed, error } = status
  let percent = written ? Math.round((written / size) * 100) : 0
  size = pretty(size)
  written = pretty(written)
  speed = pretty(speed)
  return (
    <div className='flex'>
      <div className='w-1/2 flex-none truncate'><strong>{name}</strong><br />{size}</div>
      <div className='w-1/4 flex-none text-sm'>
        <em>{step}</em><br />
        <span>{error}</span><br />
        <span className='text-blue'>{percent}%</span>
      </div>
      <div className='w-1/4 flex-none text-sm'>
        <span className='text-blue'>{speed}/s</span><br />
        <span className='text-green'>{written}</span>
      </div>
    </div>
  )
}

class Player extends React.Component {
  constructor (props) {
    super(props)
    this.video = React.createRef()
  }

  componentDidMount () {
    let video = this.video.current
    this.setup(video)
  }

  setup (video) {
    this.mediaSource = new MediaSource()
    video.src = window.URL.createObjectURL(this.mediaSource)
    this.mediaSource.addEventListener('sourceopen', () => {
      this.sourceBuffer = this.mediaSource.addSourceBuffer('video/webm; codecs="vorbis,vp8"')
      this.stream(this.sourceBuffer)
    })
  }

  stream (sourceBuffer) {
    let { stream } = this.props
    let video = this.video.current

    let bufs = []
    let free = true
    // let i = 0
    sourceBuffer.addEventListener('updateend', (e) => {
      // i++
      // console.log('updateend', i, e)
      if (video.paused) {
        video.play()
      }

      if (bufs.length) {
        sourceBuffer.appendBuffer(bufs.shift())
      } else {
        free = true
      }
    })

    sourceBuffer.addEventListener('update', (e) => {
      // console.log('Update succeeded', e)
    })

    // let j = 0
    stream.on('data', buf => {
      // console.log('rec', j, bufs.length)
      buf = new Uint8Array(buf)
      if (free) {
        free = false
        sourceBuffer.appendBuffer(buf)
      } else {
        bufs.push(buf)
      }
    })

    stream.on('end', () => {
      // this.mediaSource.endOfStream()
    })
  }

  render () {
    return <video ref={this.video} controls />
  }
}

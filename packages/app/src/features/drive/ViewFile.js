import React from 'react'
import JSONTree from 'react-json-tree'
import registry from '../../lib/component-registry'

import { useApi, Status } from '../../lib/api.js'

// function extractVersion (string) {
  // let parts = string.match(/(.*)\+([0-9]+:[0-9+])/)
  // if (parts) return [parts[1], parts[2]]
  // else return [string, null]
// }

export default function FileContent (props) {
  const { archive, path, stat } = props

  const state = useApi(async api => api.hyperdrive.readFileStream(archive, path), [archive, path])

  if (!state.data) return <Status {...state} />
  const [api, stream] = state.data

  let viewers = registry.getAll('fileViewer')
  viewers = viewers.concat(defaultViewers)

  // Todo: This is a hacky way to force rerenders.
  let change = {}
  return <FileViewer change={change} stream={stream} stat={stat} viewers={viewers} />
}

const Image = ({ content, stat }) => {
  let src = 'data:image/png;base64,' + content
  return <div className='p-4'>
    <img src={src} alt={stat.name} />
  </div>
}

const Text = ({ content }) => {
  return (
    <div className='p-4 border-2 bg-grey-lighter'>
      <pre className='overflow-hidden max-w-xl'>
        {content}
      </pre>
    </div>
  )
}

function Json (props) {
  const { content } = props
  let json
  try {
    json = JSON.parse(content)
  } catch (e) {}

  if (!json) return <Text content={content} />

  return (
    <div>
      <JSONTree
        data={json}
        invertTheme
        theme='bright'
        shouldExpandNode={(keyName, data, level) => level < 2}
      />
    </div>
  )
}

function Fallback () {
  return (
    <div className='p-4 text-xl text-grey-dark'>
      There's no viewer available for this type of file :-(
    </div>
  )
}

class Collect extends React.Component {
  constructor (props) {
    super(props)
    this.state = { done: false, content: null }
  }

  componentDidMount () {
    this.collect()
  }

  componentDidUpdate (oldProps) {
    if (this.props.stream !== oldProps.stream) this.collect()
  }

  collect () {
    let parts = []
    this.props.stream.on('data', data => {
      parts.push(data)
    })
    this.props.stream.on('end', () => {
      let content = concatenate(parts)
      this.setState({ done: true, content })
    })
  }

  render () {
    if (!this.state.done) return <div>Loading</div>
    else return this.props.children(this.state.content)
  }
}

const defaultViewers = [
  {
    component: Image,
    opts: {
      stream: false,
      format: 'base64',
      match: ({ mimetype }) => {
        return mimetype && mimetype.match(/image\/.*/)
      }
    }
  },
  {
    component: Json,
    opts: {
      stream: false,
      format: 'utf-8',
      match: ({ mimetype }) => {
        return mimetype && mimetype.match(/json/)
      }
    }
  },
  {
    component: Text,
    opts: {
      stream: false,
      format: 'utf-8',
      match: ({ mimetype }) => {
        return mimetype && mimetype.match(/text/)
      }
    }
  },
  {
    component: Fallback,
    opts: {
      collect: false,
      stream: false,
      format: 'utf-8',
      match: () => true
    }
  }
]

const formats = {
  'utf-8': butToUtf8String,
  'base64': bufToBase64
}

function selectViewer (viewers, file) {
  return viewers.reduce((result, current) => {
    if (result) return result
    if (current.opts.match(file)) result = current
    return result
  }, null)
}

const FileViewer = (props) => {
  const { stream, stat, viewers } = props
  let viewer = selectViewer(viewers, stat)
  let { opts, component: Viewer } = viewer
  if (opts.stream) {
    return <Viewer stream={stream} stat={stat} />
  } else if (opts.collect || opts.collect === undefined) {
    return (
      <Collect stream={stream}>
        {content => {
          if (!content.length) return null
          if (opts.format && formats[opts.format]) {
            content = formats[opts.format](content)
          }
          return <Viewer content={content} stat={stat} />
        }}
      </Collect>
    )
  } else {
    return <Viewer stat={stat} />
  }
}

// Helper functions to convert a buffer to either a UTF8 string or a base64 array.
function bufToBase64 (input) {
  var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  var output = ''
  var chr1, chr2, chr3, enc1, enc2, enc3, enc4
  var i = 0

  while (i < input.length) {
    chr1 = input[i++]
    chr2 = i < input.length ? input[i++] : Number.NaN // Not sure if the index
    chr3 = i < input.length ? input[i++] : Number.NaN // checks are needed here

    enc1 = chr1 >> 2
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
    enc4 = chr3 & 63

    if (isNaN(chr2)) {
      enc3 = enc4 = 64
    } else if (isNaN(chr3)) {
      enc4 = 64
    }
    output += keyStr.charAt(enc1) + keyStr.charAt(enc2) +
      keyStr.charAt(enc3) + keyStr.charAt(enc4)
  }
  return output
}

function butToUtf8String (buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf))
}

function concatenate (bufs) {
  let totalLength = 0
  for (let buf of bufs) {
    totalLength += buf.length
  }
  let result = new Uint8Array(totalLength)
  let offset = 0
  for (let buf of bufs) {
    result.set(buf, offset)
    offset += buf.length
  }
  return result
}

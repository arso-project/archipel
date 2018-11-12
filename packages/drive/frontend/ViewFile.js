import React from 'react'
import PropTypes from 'prop-types'
import { Heading } from '@archipel/ui'
import RpcQuery from '@archipel/app/src/features/RpcQuery'
import { WithCore } from 'ucore/react'

function matchComponent (file) {
  let { mimetype } = file
  if (mimetype.match(/image\/.*/)) {
    return Image
  }
  return FileContent
}

const Image = ({ content, stat }) => {
  let base64 = bufToBase64(content)
  let src = 'data:image/png;base64,' + base64
  return <div className='p-4'>
    <img src={src} alt={stat.name} />
  </div>
}

const FileContent = ({ content }) => {
  content = butToUtf8String(content)
  return (
    <div className='p-4 border-2 bg-grey-lighter'>
      <pre className='overflow-hidden max-w-xl'>
        {content}
      </pre>
    </div>
  )
}

class Collect extends React.Component {
  constructor (props) {
    super(props)
    this.content = null
    this.state = { done: false }
  }

  componentDidMount () {
    let parts = []
    this.props.stream.on('data', data => {
      parts.push(data)
    })
    this.props.stream.on('end', () => {
      this.content = concatenate(parts)
      this.setState({ done: true })
    })
  }

  render () {
    if (!this.state.done) return <div>Loading</div>
    else return this.props.children(this.content)
  }
}

const defaultViewers = [
  {
    component: Image,
    opts: {
      stream: false,
      match: ({ mimetype }) => {
        return mimetype.match(/image\/.*/)
      }
    }
  },
  {
    component: FileContent,
    opts: {
      stream: false,
      match: () => true
    }
  }
]

function selectViewer (viewers, file) {
  return viewers.reduce((result, current) => {
    if (result) return result
    if (current.opts.match(file)) result = current
    return result
  }, null)
}

const ViewFile = (props) => {
  const { path, stat, archive } = props
  return (
    <div>
      <Heading>{path}</Heading>
      <WithCore>
        {core => (
          <RpcQuery {...props} fetch={props => ['fs/readFileStream', { key: props.archive, path: props.path }]}>
            {(data) => {
              let viewers = core.components.getAll('fileViewer') || []
              viewers = viewers.concat(defaultViewers)
              let viewer = selectViewer(viewers, stat)
              let Viewer = viewer.component
              if (viewer.opts.stream) {
                return <Viewer stream={data.stream} stat={stat} />
              } else {
                return (
                  <Collect stream={data.stream}>
                    {content => <Viewer content={content} stat={stat} />}
                  </Collect>
                )
              }
            }}
          </RpcQuery>
        )}
      </WithCore>
    </div>
  )
}

ViewFile.propTypes = {
  archive: PropTypes.string,
  file: PropTypes.string
}

export default ViewFile

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

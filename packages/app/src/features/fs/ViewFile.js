import React from 'react'
import PropTypes from 'prop-types'
import { Heading } from '@archipel/ui'
import RpcQuery from '../util/RpcQuery'

function matchComponent (file) {
  let { mimetype } = file
  if (mimetype.match(/image\/.*/)) {
    return Image
  }
  return FileContent
}

const Image = ({ content, stat }) => {
  let base64 = bufToBase64(content.data)
  let src = 'data:image/png;base64,' + base64
  return <div className='p-4'>
    <img src={src} alt={stat.name} />
  </div>
}

const FileContent = ({ content }) => {
  content = butToUtf8String(content.data)
  return (
    <div className='p-4 border-2 bg-grey-lighter'>
      <pre className='overflow-hidden max-w-xl'>
        {content}
      </pre>
    </div>
  )
}

const ViewFile = (props) => {
  const { path, stat, archive } = props
  return (
    <div>
      <Heading>{path}</Heading>
      <RpcQuery {...props} fetch={props => ['fs/readFile', { key: props.archive, path: props.path }]}>
        {(data) => {
          let ContentRender = matchComponent(stat)
          return <ContentRender content={data.content} stat={stat} />
        }}
      </RpcQuery>
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

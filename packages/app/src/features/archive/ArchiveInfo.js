import React from 'react'
import { Consumer } from 'ucore/react'
// import { select } from './duck'
import { Heading } from '@archipel/ui'

const ArchiveInfo = ({ archive }) => {
  return <Consumer store='archive' select={'selectedArchive'}>
    {(archive) => {
      if (!archive) return null
      return (
        <div>
          <Heading>Archive: {archive.title}</Heading>
          <pre>Key: {archive.key}</pre>
        </div>
      )
    }}
  </Consumer>
}

export default ArchiveInfo

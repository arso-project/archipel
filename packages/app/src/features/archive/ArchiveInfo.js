import React from 'react'
import { Consumer } from 'ucore/react'
import { Heading } from '@archipel/ui'
import ToggleButton from 'react-toggle-button'

const ArchiveInfo = () => {
  return <Consumer store='archive' select={'selectedArchive'}>
    {(archive, { shareArchive }) => {
      console.log(archive)
      if (!archive) return null
      let key = archive.key
      return (
        <div>
          <Heading>Archive: {archive.title}</Heading>
          <pre>Key: {archive.key}</pre>
          <pre>Shared:
            <ToggleButton inactiveLabel='NO' activeLabel='YES'
              value={archive.status.share}
              onToggle={() => shareArchive(key, !archive.status.share)}
            />
          </pre>
        </div>
      )
    }}
  </Consumer>
}

export default ArchiveInfo

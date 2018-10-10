import React from 'react'
import ReduxQuery from '../util/ReduxQuery'
import { select } from './duck'
import { Heading } from '@archipel/ui'

const ArchiveInfo = ({ archive }) => {
  return <ReduxQuery select={select.archiveByKey} archive={archive} async={false} >
    {(archive) => {
      console.log('archive', archive)
      return (
        <div>
          <Heading>{archive.title}</Heading>
          <pre>{archive.key}</pre>
        </div>
      )
    }}
  </ReduxQuery>
}

export default ArchiveInfo

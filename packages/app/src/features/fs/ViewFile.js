import React from 'react'
import PropTypes from 'prop-types'
import { Heading } from '@archipel/ui'
import { apiAction } from '../../lib/rpc'
import BackendQuery from '../util/BackendQuery'

const FileContent = ({ content }) => {
  return (
    <div className='p-4 border-2 bg-grey-lighter'>
      <pre className='overflow-hidden'>
        {content}
      </pre>
    </div>
  )
}

const ViewFile = (props) => {
  const { path } = props
  return (
    <div>
      <Heading>{path}</Heading>
      <BackendQuery {...props} request={(props) => ['fs/fileContent', { key: props.archive, path: props.path }]}>
        {(data) => <FileContent content={data.content} />}
      </BackendQuery>
    </div>
  )
}

ViewFile.propTypes = {
  archive: PropTypes.string,
  file: PropTypes.string
}

export default ViewFile

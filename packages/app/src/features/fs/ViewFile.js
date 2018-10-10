import React from 'react'
import PropTypes from 'prop-types'
import { Heading } from '@archipel/ui'
import { apiAction } from '../../lib/rpc'
import BackendQuery from '../util/BackendQuery'

const FileContent = ({content}) => {
  return (
    <div className='p-4 border-2 bg-grey-lighter'>
      <pre className='overflow-hidden'>
        {content}
      </pre>
    </div>
  )
}

const loadFileContent = async (props) => {
  const { archive, file } = props
  const meta = { key: archive, file: file }
  return apiAction({ type: 'FILE_LOAD', meta })
}

const ViewFile = (props) => {
  const { file } = props
  return (
    <div>
      <Heading>{file}</Heading>
      <BackendQuery {...props} fetch={loadFileContent}>
        {(fileContent) => <FileContent content={fileContent} />}
      </BackendQuery>
    </div>
  )
}

ViewFile.propTypes = {
  archive: PropTypes.string,
  file: PropTypes.string
}

export default ViewFile

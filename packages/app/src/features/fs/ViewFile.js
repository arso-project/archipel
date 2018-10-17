import React from 'react'
import PropTypes from 'prop-types'
import { Heading } from '@archipel/ui'
import RpcQuery from '../util/RpcQuery'

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
      <RpcQuery {...props} fetch={props => ['fs/readFile', { key: props.archive, path: props.path }]}>
        {(data) => <FileContent content={data.content} /> }
      </RpcQuery>
    </div>
  )
}

ViewFile.propTypes = {
  archive: PropTypes.string,
  file: PropTypes.string
}

export default ViewFile

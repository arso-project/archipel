import React from 'react'
import { Heading } from '@archipel/ui'
import { connect } from 'react-redux'
import { apiAction } from '../../lib/rpc'
import { defaultAsyncState } from  '../../redux-utils'

import { loadFile, selectFile, FILE_LOAD } from './duck'

import Maybe from '../util/Maybe'

const FileContent = ({content}) => {
  return (
    <div className='p-4 border-2 bg-grey-lighter'>
      {/* <Heading>{filename}</Heading> */}
      <pre>
        {content}
      </pre>
    </div>
  )
}

class ViewFile extends React.Component {
  constructor () {
    super()
    this.state = { file: defaultAsyncState() }
  }
  componentDidMount () {
    this.loadFile()
    // this.props.onFileChange(this.props.archive, this.props.id)
  }

  componentDidUpdate (prevProps) {
    if (prevProps.archive !== this.props.archive || prevProps.file !== this.props.file) {
      this.loadFile()
      // this.props.onFileChange(this.props.archive, this.props.id)
    }
  }

  async loadFile () {
    const meta = { key: this.props.archive, file: this.props.file }
    try {
      const file = await apiAction({ type: 'FILE_LOAD', meta })
      file.data = file.payload
      this.setState({ file })
    } catch (e) {
    }
  }

  render () {
    const filename = this.props.file
    const { file } = this.state
    return (
      <div>
        <Heading>{filename}</Heading>
        <Maybe {...file}>
          {(file) => {
            return <div><FileContent content={file} /></div>
          }}
        </Maybe>
      </div>
    )
  }
}

export default ViewFile

// const mapDispatchToProps = dispatch => {
//   return {
//     onFileChange: (archive, file) => dispatch(loadFile(archive, file))
//   }
// }

// const mapStateToProps = (state, props) => ({
//   file: selectFile(state, props.archive, props.dir)
// })

// export default connect(mapStateToProps, mapDispatchToProps)(ViewFile)

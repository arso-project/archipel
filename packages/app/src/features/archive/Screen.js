import React from 'react'
import { connect } from 'react-redux'

import ListArchives from './ListArchives'
import ListDir from './ListDir'
import CreateArchive from './CreateArchive'
import CreateDir from './CreateDir'

import ViewFile from './ViewFile'

class ArchiveScreen extends React.Component {
  constructor () {
    super()
    this.state = { archive: null, dirs: ['/'], file: null }
    this.selectArchive = this.selectArchive.bind(this)
    this.selectFile = this.selectFile.bind(this)
  }

  selectArchive (archive) {
    const self = this
    return function (e) {
      self.setState({archive: archive.key})
    }
  }

  selectFile (file) {
    const self = this
    return function (e) {
      let { path, name, isDirectory } = file
      if (path === '/') path = ''
      const newPath = path + '/' + name
      if (isDirectory) {
        self.setState({ file: null, dirs: [...self.state.dirs, newPath] })
      } else {
        self.setState({ file: newPath })
      }
    }
  }

  render () {
    const { archive, dirs, file } = this.state

    const Archives = () => (
      <div className='p-2'>
        <CreateArchive />
        <ListArchives onSelect={this.selectArchive} />
      </div>
    )

    const Dir = ({dir}) => (
      <div className='p-2'>
        <CreateDir archive={archive} dir={dir} />
        <ListDir archive={archive} dir={dir} onSelect={this.selectFile} />
      </div>
    )

    const File = () => (
      <div className='p-2'>
        <ViewFile archive={archive} file={file} />
      </div>
    )

    return <div className='ma-4'>
      <div className='flex mb-4'>
        <Archives />
        {archive && dirs.map(dir => <Dir dir={dir} />)}
        {(archive && file) && <File />}
      </div>
    </div>
  }
}

const mapState = ({ workspace }) => ({
  workspace
})

export default connect(mapState)(ArchiveScreen)

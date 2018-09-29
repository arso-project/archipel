import React from 'react'
import { Heading } from '@archipel/ui'

import ListArchives from './ListArchives'
import ListDir from './ListDir'
import CreateArchive from './CreateArchive'
import CreateDir from './CreateDir'
import UploadFile from './UploadFile'
import ViewFile from './ViewFile'

const Archives = ({onSelect}) => (
  <div className='p-2 w-1/4'>
    <CreateArchive />
    <ListArchives onSelect={onSelect} />
  </div>
)

const Dir = ({archive, dir, depth, onSelect}) => (
  <div className='p-2 w-1/4'>
    <Heading>{dir}</Heading>
    <CreateDir archive={archive} dir={dir} />
    <UploadFile archive={archive} dir={dir} />
    <ListDir archive={archive} dir={dir} onSelect={onSelect} />
  </div>
)

const File = ({archive, file}) => (
  <div className='p-2 w-1/4'>
    <ViewFile archive={archive} file={file} />
  </div>
)

class ArchiveScreen extends React.PureComponent {
  constructor () {
    super()
    this.state = { archive: null, dirs: ['/'], file: null }
    this.selectArchive = this.selectArchive.bind(this)
    this.selectFile = this.selectFile.bind(this)
  }

  selectArchive (archive) {
    const self = this
    return function (e) {
      self.setState({archive: archive.key, dirs: ['/']})
    }
  }

  selectFile (depth) {
    const self = this
    return (file) => (e) => {
      let { path, name, isDirectory } = file
      if (path === '/') path = ''
      const filepath = path + '/' + name
      if (isDirectory) {
        let newDirs
        if (depth >= self.state.dirs) newDirs = [...self.state.dirs, filepath]
        else newDirs = self.state.dirs.slice(0, depth + 1).concat([filepath])
        self.setState({ file: null, dirs: [...newDirs] })
      } else {
        self.setState({ file: filepath })
      }
    }
  }

  render () {
    const { archive, dirs, file } = this.state

    return <div className='ma-4'>
      <div className='flex mb-4'>
        <Archives onSelect={this.selectArchive} />
        {archive && dirs.map((dir, i) => <Dir archive={archive} key={i} dir={dir} depth={i} onSelect={this.selectFile(i)} />)}
        {(archive && file) && <File archive={archive} file={file} />}
      </div>
    </div>
  }
}

export default ArchiveScreen

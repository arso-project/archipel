import React from 'react'
import { Heading, Foldable } from '@archipel/ui'

import ListDir from './ListDir'
import CreateDir from './CreateDir'
import UploadFile from './UploadFile'
import ViewFile from './ViewFile'

const Dir = ({ archive, dir, depth, onSelect }) => (
  <div className='p-2 w-1/4'>
    <Heading>{dir}</Heading>
    <Foldable heading='Actions'>
      <CreateDir archive={archive} dir={dir} />
      <UploadFile archive={archive} dir={dir} />
    </Foldable>
    <ListDir archive={archive} dir={dir} onSelect={onSelect} />
  </div>
)

const File = ({ archive, path }) => (
  <div className='p-2 w-1/4'>
    <ViewFile archive={archive} path={path} />
  </div>
)

class FsScreen extends React.PureComponent {
  constructor () {
    super()
    this.state = { dirs: ['/'], file: null }
    this.selectFile = this.selectFile.bind(this)
  }

  componentDidUpdate (prevProps) {
    if (prevProps.archive !== this.props.archive) this.setState({ dirs: ['/'], file: null })
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
    const { archive } = this.props
    const { dirs, file } = this.state

    return <div>
      <div className='flex mb-4 max-w-full'>
        {dirs.map((dir, i) => <Dir archive={archive} key={i} dir={dir} depth={i} onSelect={this.selectFile(i)} />)}
        {file && <File archive={archive} path={file} />}
      </div>
    </div>
  }
}

export default FsScreen

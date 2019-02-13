import React from 'react'
import { Heading, Modal } from '@archipel/ui'

import ListDir from './ListDir'
import CreateDir from './CreateDir'
import UploadFile from './UploadFile'
import ViewFile from './ViewFile'
import Sidebar from './Sidebar'
import { Consumer } from 'ucore/react'

const DirTree = ({ archive, dir, selected, onSelect }) => (
  <div>
    <ListDir archive={archive} dir={dir} selected={selected} onSelect={onSelect} focus />
  </div>
)

const DirGrid = ({ archive, dir, selected, onSelect }) => (
  <div className=''>
    <div>
      <Heading>{dir}</Heading>
      <Modal toggle='Actions'>
        <CreateDir archive={archive} dir={dir} />
        <UploadFile archive={archive} dir={dir} />
      </Modal>
    </div>
    <div>
      <ListDir archive={archive} dir={dir} selected={selected} onSelect={onSelect} grid />
    </div>
  </div>
)

// const File = ({ archive, path }) => (
//   <div className='p-2 w-1/4'>
//     <ViewFile archive={archive} path={path} />
//   </div>
// )

const Content = ({ archive, path, onSelect }) => (
  <Consumer store='fs' select='getStat' archive={archive} path={path}>
    {(stat) => {
      if (!stat) return null
      if (stat.isDirectory) return <DirGrid archive={archive} dir={path} onSelect={onSelect} />
      else return <ViewFile archive={archive} path={path} stat={stat} />
    }}
  </Consumer>
)

class FsScreen extends React.PureComponent {
  constructor () {
    super()
    this.state = { selected: '/' }
    this.selectFile = this.selectFile.bind(this)
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.archive !== this.props.archive) this.setState({ selected: '/' })
  }

  componentDidMount () {

  }

  selectFile (fileOrPath, version) {
    const self = this
    return (e) => {
      self.setState({ selected: typeof fileOrPath === 'object' ? fileOrPath.path : fileOrPath, version })
    }
  }

  render () {
    const { archive } = this.props
    const { selected, version } = this.state

    return <div>
      <div className='flex mb-4 max-w-full'>
        {/* {dirs.map((dir, i) => <Dir archive={archive} key={i} dir={dir} depth={i} onSelect={this.selectFile(i)} />)} */}
        <div className='flex-0 mr-4 w-64'>
          <Heading>Directories</Heading>
          {<DirTree archive={archive} dir={'/'} selected={selected} onSelect={this.selectFile} />}
        </div>
        <div className='flex-1'>
          {selected && <Content archive={archive} path={selected} version={version} onSelect={this.selectFile} />}
        </div>
        <div className='flex-0 w-64'>
          {selected && <Sidebar archive={archive} path={selected} />}
        </div>
      </div>
    </div>
  }
}

export default FsScreen

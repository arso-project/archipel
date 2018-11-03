import React from 'react'
import { Heading, Modal } from '@archipel/ui'

import ListDir from './ListDir'
import CreateDir from './CreateDir'
import UploadFile from './UploadFile'
import ViewFile from './ViewFile'
import { Consumer } from 'ucore/react'

const Dir = ({ archive, dir, selected, full, onSelect }) => (
  <div className=''>
    { full && (
      <React.Fragment>
        <Heading>{dir}</Heading>
        <Modal toggle='Actions'>
          <CreateDir archive={archive} dir={dir} />
          <UploadFile archive={archive} dir={dir} />
        </Modal>
      </React.Fragment>
    )}
    <ListDir archive={archive} dir={dir} selected={selected} onSelect={onSelect} full={full} />
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
      if (stat.isDirectory) return <Dir archive={archive} dir={path} onSelect={onSelect} full />
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

  selectFile (fileOrPath) {
    const self = this
    return (e) => {
      self.setState({ selected: typeof fileOrPath === 'object' ? fileOrPath.path : fileOrPath })
    }
  }

  render () {
    const { archive } = this.props
    const { selected } = this.state

    return <div>
      <div className='flex mb-4 max-w-full'>
        {/* {dirs.map((dir, i) => <Dir archive={archive} key={i} dir={dir} depth={i} onSelect={this.selectFile(i)} />)} */}
        <div className='flex-0 mr-4'>
          <Heading>Directories</Heading>
          {<Dir archive={archive} dir={'/'} selected={selected} onSelect={this.selectFile} />}
        </div>
        <div className='flex-1'>
          {selected && <Content archive={archive} path={selected} onSelect={this.selectFile} />}
        </div>
      </div>
    </div>
  }
}

export default FsScreen

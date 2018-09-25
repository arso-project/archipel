import React from 'react'
import { connect } from 'react-redux'
import SelectWorkspace from './features/workspace/SelectWorkspace' 
import ListArchives from './features/archive/ListArchives'
import DirList from './features/archive/DirList'

const mapState = ({ workspace }) => ({
  workspace
})

export default connect(mapState)(class App extends React.Component {
  constructor () {
    super()
    this.state = { archive: null }
    this.selectArchive = this.selectArchive.bind(this)
  }

  selectArchive (archive) {
    const self = this
    return function (e) {
      console.log('SELECT ARCHIVE', archive)
      self.setState({archive: archive.key})
    }
  }

  render () {
    const { archive } = this.state
    const { workspace } = this.props
    return <div className='p-4'>
      <SelectWorkspace />
      <div className='flex p-4 border-2'>
        {workspace && <ListArchives onSelect={this.selectArchive} />}
        {archive && <DirList archive={archive} dir={'/'} />}
      </div>
    </div>
  }
})

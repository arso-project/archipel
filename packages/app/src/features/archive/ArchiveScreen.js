import React from 'react'
import { Tabs } from '@archipel/ui'

import ListArchives from './ListArchives'
import CreateArchive from './CreateArchive'

const Archives = ({onSelect}) => (
  <div className='p-2 w-1/4 flex-no-shrink'>
    <CreateArchive />
    <ListArchives onSelect={onSelect} />
  </div>
)

class ArchiveScreen extends React.PureComponent {
  constructor () {
    super()
    this.state = { archive: null, dirs: ['/'], file: null }
    this.selectArchive = this.selectArchive.bind(this)
    // todo: rethink this app root thing of course.
    this.archiveTabs = window.__archipelApp.getAll('archiveTabs')
  }

  selectArchive (archive) {
    const self = this
    return function (e) {
      self.setState({archive: archive.key, dirs: ['/']})
    }
  }

  render () {
    const { archive } = this.state

    return <div className='ma-4'>
      <div className='flex mb-4'>
        <Archives onSelect={this.selectArchive} selected={archive} />
        <div className='flex-1 w-3/4'>
          { archive && <Tabs tabs={this.archiveTabs} archive={archive} /> }
        </div>
      </div>
    </div>
  }
}

export default ArchiveScreen

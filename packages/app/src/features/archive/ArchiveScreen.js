import React from 'react'
import { Tabs } from '@archipel/ui'

import ListArchives from './ListArchives'
import CreateArchive from './CreateArchive'

import { Consumer, WithCore } from 'ucore/react'

const ArchiveList = ({ onSelect }) => (
  <Consumer store='archive' select={'sortedByName'}>
    {(archives, { selectArchive }) => (
      // Probably not the best place to unite onSelect passed down from ArchiveScreen and the update of the archive store!
      <ListArchives archives={archives} onSelect={(item, i) => (e) => { onSelect(item, i)(e); selectArchive(item.key) }} />
    )}
  </Consumer>
)

class ArchiveScreen extends React.PureComponent {
  constructor (props) {
    super()
    this.state = { archive: null }
    this.selectArchive = this.selectArchive.bind(this)
    // todo: rethink this app root thing of course.
    this.archiveTabs = props.core.components.getAll('archiveTabs').map(item => {
      return { title: item.opts.title, component: item.component }
    })
  }

  selectArchive (archive) {
    const self = this
    return function (e) {
      self.setState({ archive: archive.key })
    }
  }

  render () {
    const { archive } = this.state

    return <div className='ma-4'>
      <div className='flex mb-4'>
        <div className='p-2 w-1/4 flex-no-shrink'>
          <CreateArchive />
          <ArchiveList onSelect={this.selectArchive} />
        </div>
        <div className='flex-1 w-3/4'>
          { archive && <Tabs tabs={this.archiveTabs} archive={archive} /> }
        </div>
      </div>
    </div>
  }
}

export default (props) => <WithCore>{core => <ArchiveScreen {...props} core={core} />}</WithCore>

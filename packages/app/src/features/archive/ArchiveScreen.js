import React from 'react'
import { Tabs, List } from '@archipel/ui'

import ReduxQuery from '../util/ReduxQuery'
import { actions, select } from './duck'

import ListArchives from './ListArchives'
import CreateArchive from './CreateArchive'

import { Consumer } from 'ucore/react'

const Archives = ({onSelect}) => (
  <div className='p-2 w-1/4 flex-no-shrink'>
    <ListArchives onSelect={onSelect} />
  </div>
)

class ArchiveScreen extends React.PureComponent {
  constructor () {
    super()
    this.state = { archive: null }
    this.selectArchive = this.selectArchive.bind(this)
    // todo: rethink this app root thing of course.
    this.archiveTabs = window.__archipelApp.getAll('archiveTabs')
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
        </div>
      </div>
      <Consumer store='archive' select={'sortedByName'}>
        {(archives) => (
          <div className='flex mb-4'>
            <div className='p-2 w-1/4 flex-no-shrink'>
              <ListArchives archives={archives} onSelect={this.selectArchive} />
            </div>
            <div className='flex-1 w-3/4'>
              { archive && <Tabs tabs={this.archiveTabs} archive={archive} /> }
            </div>
          </div>
        )}
      </Consumer>
    </div>
  }
}

export default ArchiveScreen

import React from 'react'
import { Tabs, List } from '@archipel/ui'

import ReduxQuery from '../util/ReduxQuery'
import { actions, select } from './duck'

import ListArchives from './ListArchives'
import CreateArchive from './CreateArchive'

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
    this.fetch = this.fetch.bind(this)
    // todo: rethink this app root thing of course.
    this.archiveTabs = window.__archipelApp.getAll('archiveTabs')
  }

  selectArchive (archive) {
    const self = this
    return function (e) {
      self.setState({ archive: archive.key })
    }
  }

  fetch (dispatch) {
    this.setState({ archive: null })
    dispatch(actions.loadArchives)
  }

  render () {
    const { archive } = this.state

    return <div className='ma-4'>
      <ReduxQuery select={select.sortedByName} fetch={this.fetch} shouldRefetch={() => false}>
        {(archives) => (
          <div className='flex mb-4'>
            <div className='p-2 w-1/4 flex-no-shrink'>
              <CreateArchive />
              <ListArchives archives={archives} onSelect={this.selectArchive} />
            </div>
            <div className='flex-1 w-3/4'>
              { archive && <Tabs tabs={this.archiveTabs} archive={archive} /> }
            </div>
          </div>
        )}
      </ReduxQuery>
    </div>
  }
}

export default ArchiveScreen

import React from 'react'
import { Tabs } from '@archipel/ui'

import ListArchives from './ListArchives'
import CreateArchive from './CreateArchive'
import AddArchive from './AddArchive'

import { Consumer } from 'ucore/react'

class ArchiveScreen extends React.PureComponent {
  render () {
    const { archives, selectedArchive, onSelect, tabs } = this.props
    const archive = selectedArchive ? selectedArchive.key : null

    return <div className='ma-4'>
      <div className='flex mb-4'>
        <div className='p-2 w-64 flex-no-shrink'>
          <CreateArchive />
          <AddArchive />
          <ListArchives archives={archives} selected={archive} onSelect={(item, i) => (e) => { onSelect(item.key) }} />
        </div>
        <div className='flex-1'>
          { archive && <Tabs tabs={tabs} archive={archive} /> }
        </div>
      </div>
    </div>
  }
}

export default (props) => (
  <Consumer store='archive' select={['sortedByName', 'selectedArchive']}>
    {([archives, selectedArchive], store) => {
      let archiveTabs = store.core.components.getAll('archiveTabs').map(mapRegisteredToTabs)
      return <ArchiveScreen {...props}
        archives={archives}
        selectedArchive={selectedArchive}
        tabs={archiveTabs}
        onSelect={store.selectArchive} />
    }}
  </Consumer>
)

function mapRegisteredToTabs (item) {
  return { title: item.opts.title, component: item.component }
}

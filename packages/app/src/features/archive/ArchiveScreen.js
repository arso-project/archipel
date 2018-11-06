import React from 'react'
import { Tabs, Heading } from '@archipel/ui'

import ListArchives from './ListArchives'
import CreateArchive from './CreateArchive'
import AddArchive from './AddArchive'

import { Consumer } from 'ucore/react'

class ArchiveScreen extends React.PureComponent {
  render () {
    const { archives, selectedArchive, onSelect, tabs, chrome } = this.props
    const archive = selectedArchive ? selectedArchive.key : null

    let sidebarCls = 'flex-no-shrink border-r-2 w-65 '
    if (!chrome) sidebarCls += 'hidden'

    return (
      <div className='flex flex-1'>
        <div className={sidebarCls} >
          <CreateArchive />
          <AddArchive />
          <ListArchives
            archives={archives}
            isSelected={item => item === selectedArchive}
            onSelect={(item, i) => (e) => { onSelect(item.key) }}
          />
        </div>
        <div className='flex-1 p-4'>
          { selectedArchive && <Heading className='mt-0' size={8}>{selectedArchive.info.title}</Heading> }
          { archive && <Tabs tabs={tabs} archive={archive} /> }
        </div>
      </div>
    )
  }
}

export default (props) => (
  <Consumer store='archive' select={['sortedByName', 'selectedArchive']} chrome={props.chrome}>
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

import storeConstructor from './store'
import ArchiveInfo from './ArchiveInfo'
import ArchiveSharing from './ArchiveSharing'

export default {
  plugin: archivePlugin
}

async function archivePlugin (core, opts) {
  core.components.add('archiveTabs', ArchiveInfo, { title: 'Info' })
  core.components.add('archiveTabs', ArchiveSharing, { title: 'Sharing' })

  let store = core.makeStore('archive', storeConstructor)

  core.getStore('workspace').subscribe(onWorkspaceChange, 'current')
  function onWorkspaceChange (state, oldState) {
    store.loadArchives()
  }

  core.rpc.reply('archive/writeNetworkStats', (req) => {
    core.getStore('archive').writeNetworkStats(req)
  })
}

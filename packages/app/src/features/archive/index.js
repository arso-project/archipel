import duck from './duck'
import storeConstructor from './store'
import ArchiveInfo from './ArchiveInfo'

export default {
  duck,
  plugin: archivePlugin,
  archiveTabs: [{
    title: 'Info',
    component: ArchiveInfo
  }]
}

async function archivePlugin (core, opts) {
  let store = core.makeStore('archive', storeConstructor)
  core.getStore('workspace').subscribe(onWorkspaceChange, 'current')
  function onWorkspaceChange (state, oldState) {
    store.loadArchives()
  }
}

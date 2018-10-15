import duck from './duck'
import store from './store'
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
  core.makeStore('archive', store)
}

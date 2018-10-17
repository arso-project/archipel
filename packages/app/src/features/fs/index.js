import store from './store'
import FsScreen from './FsScreen'

export default {
  plugin: fsPlugin,
  archiveTabs: [{
    title: 'Files',
    component: FsScreen
  }]
}

async function fsPlugin (core, opts) {
  core.makeStore('fs', store)
}

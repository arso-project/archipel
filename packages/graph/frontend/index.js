import GraphScreen from './GraphScreen'
import DebugScreen from './DebugScreen'
import FileSidebar from './FileSidebar'
import store from './store'

export default {
  name: 'graph-frontend',
  plugin
}

async function plugin (core) {
  // core.rpc.request('graph/hello')
  core.makeStore('graph', store)
  core.components.add('archiveTabs', GraphScreen, { title: 'Graph' })
  core.components.add('archiveTabs', DebugScreen, { title: 'GraphDebug' })
  core.components.add('fileSidebar', FileSidebar, { title: 'Graph' })
}

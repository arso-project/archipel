import GraphScreen from './GraphScreen'
import store from './store'

export default {
  name: 'graph-frontend',
  plugin
}

async function plugin (core) {
  // core.rpc.request('graph/hello')
  core.makeStore('graph', store)
  core.components.add('archiveTabs', GraphScreen, { title: 'Graph' })
}

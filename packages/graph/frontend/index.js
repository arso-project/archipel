import GraphScreen from './GraphScreen'

export default {
  name: 'graph-frontend',
  plugin
}

async function plugin (core) {
  // core.rpc.request('graph/hello')
  core.components.add('archiveTabs', GraphScreen, { title: 'Graph' })
}

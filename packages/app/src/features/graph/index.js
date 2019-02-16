import Tag, { TagOverview } from './Tag'
import store from './store'

export default {
  name: 'graph-frontend',
  plugin
}

async function plugin (core) {
  core.makeStore('graph', store)
  core.components.add('archiveTabs', TagOverview, { title: 'Graph' })

  // core.components.add('archiveTabs', DebugScreen, { title: 'GraphDebug' })
  // core.components.add('fileSidebar', FileSidebar, { title: 'Graph' })
  core.components.add('fileSidebar', Tag, { title: 'Tags' })
}

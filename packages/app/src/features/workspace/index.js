import store from './store'

export default {
  plugin: workspacePlugin
}

async function workspacePlugin (core, opts) {
  core.makeStore('workspace', store)
}

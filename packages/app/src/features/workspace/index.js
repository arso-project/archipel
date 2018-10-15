import duck from './duck'
import store from './store'

export default {
  duck,
  plugin: workspacePlugin
}

async function workspacePlugin (core, opts) {
  core.makeStore('workspace', store)
}

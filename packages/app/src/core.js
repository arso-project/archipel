// ucore
import ucore from 'ucore'
import store from 'ucore/store'

// new api
import { getApi } from './lib/rpc-client.js'

// core
import { ucorePlugin as componentRegistry } from './lib/component-registry'
import archive from './features/archive'
import graph from './features/graph'

// settings
const websocketUrl = window.ARCHIPEL_WEBSOCKET_URL
  ? window.ARCHIPEL_WEBSOCKET_URL
  : window.location.origin.replace(/^http/, 'ws') + '/ucore'

function boot (extensions) {
  // ucore
  const core = ucore()
  core.register(store)

  // core libs
  core.use(componentRegistry)

  // new api
  core.use(async (core) => {
    const api = await getApi()
    core.decorate('api', api)
  })

  // core features
  core.register(archive)
  core.register(graph)

  extensions.forEach(extension => core.register(extension.default ? extension.default : extension))

  window.archipelCore = core

  return core
}

export default boot

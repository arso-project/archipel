// ucore
import ucore from 'ucore'
import rpc from 'ucore/rpc/client'
import store from 'ucore/store'

// new api
import { getApi } from './lib/rpc-client.js'

// core
import componentRegistry from './lib/component-registry'
import app from './features/app'
import workspace from './features/workspace'
import archive from './features/archive'
import drive from './features/drive'

// settings
const websocketUrl = window.ARCHIPEL_WEBSOCKET_URL
  ? window.ARCHIPEL_WEBSOCKET_URL
  : window.location.origin.replace(/^http/, 'ws') + '/ucore'

function boot (extensions) {
  // ucore
  const core = ucore()
  core.register(rpc, { url: websocketUrl })
  core.register(store)

  // core libs
  core.use(componentRegistry)

  // core features
  core.register(app)
  core.register(workspace)
  core.register(archive)
  core.register(drive)

  // new api
  core.use(async (core) => {
    const api = await getApi()
    core.decorate('api', api)
  })

  extensions.forEach(extension => core.register(extension.default ? extension.default : extension))

  window.archipelCore = core

  return core
}

export default boot

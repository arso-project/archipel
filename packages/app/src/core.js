// ucore
import ucore from 'ucore'
import ucoreRpc from 'ucore/rpc/client'
import ucoreStore from 'ucore/store'

// core
import componentRegistry from './lib/component-registry'
import app from './features/app'
import workspace from './features/workspace'
import archive from './features/archive'
import fs from './features/fs'

// extensions
import graph from '@archipel/graph'

// settings
const websocketUrl = window.ARCHIPEL_WEBSOCKET_URL
  ? window.ARCHIPEL_WEBSOCKET_URL
  : window.location.origin.replace(/^http/, 'ws') + '/ucore'

function boot () {
  // ucore
  const core = ucore()
  core.register(ucoreRpc, { url: websocketUrl })
  core.register(ucoreStore)

  // core libs
  core.use(componentRegistry)

  // core features
  core.register(app)
  core.register(workspace)
  core.register(archive)
  core.register(fs)

  // extensions
  core.register(graph)

  return core
}

function start (core) {
  core.ready((err) => {
    if (err) console.log('BOOT ERROR', err)
  })
}

const core = boot()
start(core)

export default core

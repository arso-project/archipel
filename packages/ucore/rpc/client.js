const ws = require('websocket-stream')
const makeRpcPlugin = require('./shared')

module.exports = {
  name: 'rpc-client',
  plugin: makeRpcPlugin(websocketClient)
}

function websocketClient (core, opts, handle) {
  const websocket = ws(opts.url)
  handle(websocket)

  websocket.on('error', (err) => console.log('ws error', err))
  if (typeof window !== 'undefined') window.addEventListener('beforeunload', () => websocket.close())
}

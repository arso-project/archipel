const repl = require('repl')
const websocket = require('websocket-stream')
const rpc = require('./rpc')
const streambus = require('./rpc/streambus')
const pump = require('pump')

const api = rpc()
const port = process.env.NODE_PORT || 8080
const stream = websocket('ws://localhost:' + port)

const transport = streambus()

pump(stream, transport.stream, stream)

api.addPeer(transport).then(peer => start(peer))

function start (peer) {
  const r = repl.start({
    prompt: '> '
  })
  Object.keys(peer.api).forEach(key => {
    r.context[key] = peer.api[key]
  })
}

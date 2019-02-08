const ecstatic = require('ecstatic')
const http = require('http')
const raf = require('random-access-file')
const p = require('path')
const websocket = require('websocket-stream')
const pump = require('pump')

const rpc = require('./rpc')
const streambus = require('./rpc/streambus')
const hyperlib = require('./library')
const hyperdrive = require('./structures/hyperdrive')
const hyperdb = require('./structures/hyperdb')
const { nestStorage } = require('./util/hyperstack')


// hyperlib
// const storage = function (opts) {
  // return name => raf(p.join(opts.path, name))
// }
// const storage = opts => nestStorage(raf, opts.path)
const storage = nestStorage(raf, '.db')

// hyperlib.api.useApi('storage', storage, { path: '.db' })
hyperlib.api.useApi('storage', storage)
hyperlib.api.useHandler('hyperdrive', hyperdrive.structure)
hyperlib.api.useHandler('hyperdb', hyperdb.structure)

// rpc
const api = rpc()
api.use('hyperlib', hyperlib.rpc)
api.use('hyperdrive', hyperdrive.rpc, { hyperlib: hyperlib.api })

// server
const static = ecstatic({
  root: './dist',
  showDir: false
})

const server = http.createServer(static)
const wss = websocket.createServer({ server }, (stream, request) => {
  console.log('new connection!')
  const transport = streambus()
  pump(stream, transport.stream, stream)
  api.addPeer(transport).then(peer => {
    console.log('session established', peer.api)
  })
})


server.listen(8080)


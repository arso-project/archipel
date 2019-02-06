const ecstatic = require('ecstatic')
const http = require('http')
const raf = require('random-access-file')
const p = require('path')

const rpc = require('./rpc')
const hyperlib = require('./library')
const hyperdrive = require('./structures/hyperdrive')


// hyperlib
hyperlib.useApi('storage', opts => (name) => raf(p.join(opts.path, name)), { path: '.db' })
hyperlib.useStructure('hyperdrive', hyperdrive.structure)

// rpc
const rpc = rpc()
rpc.use('hyperdrive', hyperdrive.rpc)
rpc.use('hyperlib', hyperlib.rpc)

// server
const static = ecstatic({
  root: './dist',
  showDir: false
})

const server = http.createServer(static)
const wss = websocket.createServer(server, (stream, request) => {
  console.log('new connection!')
  api.session(streambus(stream), (api, session) => {
    console.log('session established.')
  })
})


server.listen(8080)


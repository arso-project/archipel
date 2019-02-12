const ecstatic = require('ecstatic')
const http = require('http')
const raf = require('random-access-file')
const p = require('path')
const url = require('url')
const pump = require('pump')
const websocket = require('websocket-stream')

const rpc = require('@archipel/common/rpc')
const streambus = require('@archipel/common/rpc/streambus')

const config = require('./config')
const libraries = require('./lib/library')
const hyperdrive = require('./structures/hyperdrive')
const hyperdb = require('./structures/hyperdb')


const storage = name => raf(p.join(config.library.path, name))

// library
// const libraries = {}
// const openLibrary = name => {
  // if (libraries[name]) return libraries[name]
  // else {
    
  // }
// }

const hyperlib = libraries.make({ storage }, {
  hyperdrive: hyperdrive.structure,
  hyperdb: hyperdb.structure
})

// rpc
const api = rpc({
  api: {
    hyperlib
  },
  rpc: {
    hyperdrive: hyperdrive.rpc,
    hyperlib: libraries.rpc
  }
})

// server
const static = ecstatic({
  root: config.server.static,
  showDir: false
})

const server = http.createServer(static)

// websocket rpc
const wss = websocket.createServer({ server }, (stream, request) => {
  request.on('error', err => console.log('error: ', err))

  const reqUrl = url.parse(request.url)

  if (reqUrl.pathname !== '/api') return

  const transport = streambus()
  pump(stream, transport.stream, stream)
  api.addPeer(transport).then(peer => {
    console.log('session established', peer.api)
  })
  
})

// start
server.listen(config.server.port, () => {
  console.log(`server listening on port ${config.server.port}`)
})

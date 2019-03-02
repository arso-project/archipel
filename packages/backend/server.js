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
const hypergraph = require('./structures/hypergraph')

module.exports = server

function server (config, cb) {
  cb = cb || noop
  const storage = name => raf(p.join(config.library.path, name))
  console.log('libraries are stored at:', config.library.path)

  const hyperlib = libraries.make({ storage }, {
    hyperdrive: hyperdrive.structure,
    hyperdb: hyperdb.structure,
    hypergraph: hypergraph.structure
  })

  // rpc
  const api = rpc({
    api: {
      hyperlib
    },
    rpc: {
      hyperdrive: hyperdrive.rpc,
      hypergraph: hypergraph.rpc,
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
    request.on('error', err => console.error('request error: ', err))
    stream.on('error', err => console.error('stream error: ', err))

    const reqUrl = url.parse(request.url)

    if (reqUrl.pathname !== '/api') return

    const transport = streambus()
    pump(stream, transport.stream, stream)
    api.addPeer(transport).then(peer => {
      console.log('session established', peer.api)
    })
    
  })

  // Handle errors gracefully.
  // todo: find out what really is needed. kept getting ECONNRESET errors from TCP.onstreamread
  wss.on('error', (err) => console.error('socket server: error', err))
  server.on('error', (err) => console.error('http server: error', err))
  wss.on('connection', function (socket) {
    socket.on('close', (err) => console.error('socket socket: client closed connection', err))
    socket.on('error', (err) => console.error('socket socket: error', err))
  })


  // Start.
  server.listen(config.server.port, config.server.host, () => {
    console.log(`server listening on ${config.server.host}:${config.server.port}`)
    cb({ server, websocketServer: wss, rpc: api })
  })
}

function noop () {}

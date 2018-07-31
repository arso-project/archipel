var rpc = require('hyperpc')
var ws = require('websocket-stream')
var inherits = require('inherits')
var events = require('events')
var api = require('./api.js')

function ArchipelRpc (opts) {
  if (!(this instanceof ArchipelRpc)) return new ArchipelRpc(opts)
  events.EventEmitter.call(this)
  var self = this
  opts = opts || {}

  if (opts.stream) {
    handle(opts.stream)
  } else {
    var wsOpts = {
      perMessageDeflate: false,
      port: opts.port ? opts.port : null,
      host: opts.host ? opts.host : null,
      server: opts.server ? opts.server : null
    }
    this.ws = ws.createServer(wsOpts, handleWs)
    this.ws.on('error', (err) => console.log('ws server: error', err))
    this.ws.on('connection', function (socket) {
      socket.on('close', (err) => console.log('ws socket: client closed connection', err))
      socket.on('error', (err) => console.log('ws socket: error', err))
    })
  }

  function handleWs (stream, req) {
    if (req.url === opts.wsUrl || '/rpc') {
      handle(stream)
    }
  }

  function handle (stream) {
    stream.on('error', (err) => console.log('ws stream: error', err))
    var rpcStream = rpc(api, {debug: true})
    rpcStream.on('remote', (methods) => {
      self.remote = methods
      self.emit('remote')
    })
    rpcStream.pipe(stream).pipe(rpcStream)
  }
}

inherits(ArchipelRpc, events.EventEmitter)

module.exports = ArchipelRpc

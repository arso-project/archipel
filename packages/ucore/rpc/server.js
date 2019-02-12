const ws = require('websocket-stream')
const url = require('url')
const makeRpcPlugin = require('./shared')

module.exports = {
  name: 'rpc-server',
  plugin: makeRpcPlugin(websocketServer) 
}

function websocketServer (app, opts, handle) {
  opts = opts || {}

  const defaults = {
    perMessageDeflate: false,
    port: null,
    host: null,
    server: null,
    prefix: null
  }

  opts = Object.assign({}, defaults, opts)

  if (!opts.server && !opts.port && app.httpServer) {
    opts.server = app.httpServer
  }

  const websocket = ws.createServer(opts, onConnection)

  // todo: error handling.
  websocket.on('error', (err) => console.log('socket server: error', err))
  websocket.on('connection', function (socket) {
    socket.on('close', (err) => console.log('socket socket: client closed connection', err))
    socket.on('error', (err) => console.log('socket socket: error', err))
  })

  function onConnection (stream, req) {
    stream.on('error', (err) => console.log('ws stream: error', err))
    if (opts.prefix) {
      const reqUrl = url.parse(req.url)
      if (reqUrl.pathname !== opts.prefix) return
    }
    handle(stream, req)
  }
}

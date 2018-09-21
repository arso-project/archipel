const ws = require('websocket-stream')
const debug = require('debug')('websocket')

module.exports = websocket

function websocket (opts, handle) {
  opts = opts || {}

  const defaults = {
    perMessageDeflate: false,
    port: null,
    host: null,
    server: null
  }

  opts = Object.assign({}, defaults, opts)

  const websocket = ws.createServer(opts, onConnection)

  // todo: error handling.
  websocket.on('error', (err) => console.log('socket server: error', err))
  websocket.on('connection', function (socket) {
    socket.on('close', (err) => console.log('socket socket: client closed connection', err))
    socket.on('error', (err) => console.log('socket socket: error', err))
  })

  function onConnection (stream, req) {
    stream.on('error', (err) => console.log('ws stream: error', err))
    handle(stream, req)
  }
}

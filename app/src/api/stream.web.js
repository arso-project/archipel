
import websocket from 'websocket-stream'

function websocketStream (host, cb) {
  console.log('url', host)
  cb(websocket(host))
}

module.exports = websocketStream

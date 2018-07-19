var hyperpc = require('../..')
var stream = require('stream')
var net = require('net')
var fs = require('fs')
var through = require('through2')
var pump = require('pump')

var serverApi = {
  upper: (string, cb) => cb(null, string.toUpperCase()),
  readValues: (cb) => {
    var file = fs.createReadStream('./somefile')
    var splitAndNumberLines = through(function (chunk, enc, next) {
      chunk.toString().split('\n').forEach((line, i) => {
        if (line) this.push(Buffer.from(i + ': ' + line))
      })
      next()
    })
    // this is needed for hyperpc to detect the pumped stream as readable (and not duplex).
    // cb(null, duplexify(null, pump(file, splitAndNumberLines)))

    // EDIT: Fixed with a hacky code in streamType() in index.js
    // now this works:
    var s = pump(file, splitAndNumberLines)

    cb(null, s)
  },
  writeValues: (cb) => {
    var ws = new stream.Writable({
      write (chunk, enc, next) {
        console.log(chunk.toString()) // prints val1, val2
        next()
      }
    })
    ws.on('finish', () => console.log('write stream finished'))
    cb(null, ws)
  }
}

var rpc = hyperpc(serverApi, {name: 'server', log: true})

var server = net.createServer((socket) => {
  socket.setKeepAlive(true)
  socket.on('close', (hadErr) => console.log('client socket closed', hadErr))
  socket.on('error', (err) => console.log('client socket error', err))
  rpc.pipe(socket).pipe(rpc)
})

server.listen(1337, '127.0.0.1')

server.on('error', (err) => console.log('client tcp error', err))

rpc.on('remote', (api) => {
  api.updateState({
    init: true,
    timer: 0
  })
  var i = 0
  setInterval(() => {
    api.updateState({ timer: i++ })
  }, 1000)
})

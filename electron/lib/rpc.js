const dnode = require('dnode')
const { ipcMain } = require('electron')
const rpcMulti = require('rpc-multistream')
const ipcStream = require('electron-ipc-stream')

function rpc (api) {
  console.log('init rpc')
  // ipcMain.on('init', (event, arg) => {
  //   // old api.
  //   let d = dnode(api)
  //   d.on('data', (data) => {
  //     event.sender.send('dnode', data)
  //   })
  //   ipcMain.on('dnode', (event, data) => {
  //     d.write(data)
  //   })
  // })

  // ipcMain.on('init-rpc2', (event, arg) => {
  //   // new api.
  //   const stream = ipcStream('rpc', event.sender)
  //   var rpc = rpcMulti(api)
  //   rpc.pipe(stream).pipe(rpc)
  //   rpc.on('methods', (methods) => {
  //     console.log('main: got remote!')
  //   })

  //   event.sender.send('init-rpc2')
  // })

  var websocket = require('websocket-stream')
  var ws = websocket.createServer({
    port: 9099,
    perMessageDeflate: false
  // }, handle)
  }, handle)

  ws.on('error', (err) => console.log('WS error', err))

  function handle (stream, req) {
    // if (req.url === '/2') {
      var rpc = rpcMulti(api)
      rpc.on('methods', (methods) => {
        console.log('main: got ws remote!')
      })
      rpc.pipe(stream).pipe(rpc)
    // }
  }
}

module.exports = rpc

import rpc from 'rpc-multistream'
import thunky from 'thunky'
import isElectron from 'is-electron-renderer'
import websocket from 'websocket-stream'

const clientApi = {
  foo: (bar, cb) => cb(null, bar.toUpper() + ' from client!!')
}

const archipelRpc = thunky((cb) => {
  var getStream
  var host
  if (isElectron) {
    import('electron').then(({ipcRenderer}) => {
      console.log('this is electron!')
      ipcRenderer.send('rpc')
      ipcRenderer.on('rpc', (ev, port) => {
        console.log('got ws port: ' + port)
        console.log(port)
        create('ws://localhost:' + port + '/rpc', cb)
      })
    })
  } else {
    create(window.location.origin.replace(/^http/, 'ws') + '/rpc', cb)
  }
})

function create (url, cb) {
  const rpcStream = rpc(clientApi, {debug: false})
  const ws = websocket(url)
  rpcStream.pipe(ws).pipe(rpcStream)
  rpcStream.on('methods', (remote) => {
    console.log('renderer: got remote')
    cb(remote)
  })
}

export default archipelRpc

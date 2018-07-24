import hype from 'hyperpc'
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
      ipcRenderer.send('rpc')
      ipcRenderer.on('rpc', (ev, port) => {
        create('ws://localhost:' + port + '/rpc', cb)
      })
    })
  } else {
    create(window.location.origin.replace(/^http/, 'ws') + '/rpc', cb)
  }
})

function create (url, cb) {
  const rpc = hype(clientApi, {debug: false})
  const ws = websocket(url)
  rpc.pipe(ws).pipe(rpc)
  rpc.on('remote', (remote) => {
    console.log('renderer: got remote')
    cb(remote)
  })
}

export default archipelRpc

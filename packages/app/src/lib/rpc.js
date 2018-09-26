import hype from 'hyperpc'
import thunky from 'thunky'
import isElectron from 'is-electron-renderer'
import websocket from 'websocket-stream'

const clientApi = {
  foo: (bar, cb) => cb(null, bar.toUpper() + ' from client!!')
}

const rpc = thunky((cb) => {
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
  const ws = websocket(url)
  const rpc = hype(clientApi, {promise: true, debug: true})

  ws.on('error', (err) => console.log('ws error', err))
  window.addEventListener('beforeunload', () => ws.close())

  rpc.pipe(ws).pipe(rpc)
  rpc.on('remote', (remote) => cb(remote))
}

window.rpc = rpc
window.archipelApi = getApi

export function getApi () {
  return new Promise((resolve, reject) => {
    rpc(api => resolve(api))
  })
}

export function apiAction (action) {
  return new Promise ((resolve, reject) => {
    console.log('ACTION', action)
    rpc(api => api.action(action, (action) => resolve(action)))
  })
}

export default rpc

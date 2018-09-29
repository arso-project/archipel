import hype from 'hyperpc'
import thunky from 'thunky'
import isElectron from 'is-electron-renderer'
import websocket from 'websocket-stream'
import { debugFactory } from './debug'

const debug = debugFactory('rpc')

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

function logAction (way, action, ...args) {
  let style1 = 'font-weight: bold; '
  if (way === 'in') style1 += ' color: green;'
  if (way === 'out') style1 += ' color: blue;'
  // let style2 = ' font-weight: bold; color: red;'
  let style2 = 'font-weight: normal'
  if (way === 'in') way = way + ' '
  debug('apiAction %c%s %c%s %O', style1, way, style2, action.type, action, ...args)

}

export function apiAction (action) {
  logAction('out', action)
  return new Promise ((resolve, reject) => {
    rpc(api => api.action(action, (action) => {
      logAction('in', action)
      resolve(action)
    }))
  })
}

export function apiActionStream (action, stream) {
  logAction('out', action, stream)
  return new Promise ((resolve, reject) => {
    rpc(api => api.actionStream(action, stream, (action, stream) => {
      logAction('in', action, stream)
      resolve(action, stream)
    }))
  })
}

export default rpc

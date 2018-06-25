import dnode from 'dnode/browser.js'
import websocket from 'websocket-stream'
import thunky from 'thunky'

const host = window.location.origin.replace(/^http/, 'ws')
const ws = websocket(host)
const d = dnode()

export default function rpc (opts) {
  return thunky((cb) => {
    d.pipe(ws).pipe(d)
    d.on('remote', (remote) => cb(remote))
  })
}

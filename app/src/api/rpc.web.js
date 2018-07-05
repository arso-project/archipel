import dnode from 'dnode/browser.js'
import websocket from 'websocket-stream'
import thunky from 'thunky'

const host = window.location.origin.replace(/^http/, 'ws') + '/1'
const ws = websocket(host)

export default function rpc () {
  const d = dnode()
  return thunky((cb) => {
    d.pipe(ws).pipe(d)
    d.on('remote', (remote) => cb(remote))
  })
}

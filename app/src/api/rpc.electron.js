import { ipcRenderer } from 'electron'
import dnode from 'dnode/browser.js'
import thunky from 'thunky'

const d = dnode()

export default function rpc (opts) {
  return thunky((cb) => {
    ipcRenderer.send('init')
    ipcRenderer.on('init', () => {
      d.on('remote', (remote) => cb(remote))
      d.on('data', (data) => ipcRenderer.send('dnode', data))
      ipcRenderer.on('dnode', (event, data) => {
        d.write(data)
      })
    })
  })
}

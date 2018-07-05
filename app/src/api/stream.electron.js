import { ipcRenderer } from 'electron'
import ipcStream from 'electron-ipc-stream'

var stream = null
module.exports = (cb) => {
  console.log('get stream!')
  if (stream) cb(stream)
  ipcRenderer.send('init-rpc2')
  ipcRenderer.on('init-rpc2', () => {
    console.log('got init rpc2')
    stream = ipcStream('rpc')
    console.log('got stream')
    cb(stream)
  })
}

const isElectron = require('is-electron-renderer')

let rpc
if (isElectron) {
  rpc = require('./rpc.electron.js').default()
} else {
  rpc = require('./rpc.web.js').default()
}

export default rpc

import rpcMulti from 'rpc-multistream'
import thunky from 'thunky'
import isElectron from 'is-electron-renderer'

var rpc = thunky((cb) => {
  var rpcStream = rpcMulti()
  var getStream
  var host
  if (isElectron) {
    // host = null
    // getStream = require('./stream.electron.js')
    host = 'ws://localhost:9099/2'
    getStream = require('./stream.web.js')
  } else {
    host = window.location.origin.replace(/^http/, 'ws') + '/2'
    getStream = require('./stream.web.js')
  }
  getStream(host, (stream) => {
    console.log('got stream', stream)
    rpcStream.pipe(stream).pipe(rpcStream)
    rpcStream.on('methods', (remote) => {
      console.log('renderer: got remote')
      cb(remote)
    })
  })
})

export default rpc

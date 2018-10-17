var fp = require('find-free-port')
var ipcMain = require('electron').ipcMain

var boot = require('@archipel/core/boot')

module.exports = function (win) {
  fp(5000, (err, port) => {
    if (err) throw err
    let opts = {
      noHttp: true,
      rpc: { host: '127.0.0.1', port }
    }

    boot(opts).then(core => {
      ipcMain.on('rpc', (event, arg) => {
        event.sender.send('rpc', port)
      })
    })
  })
}

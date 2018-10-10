var fp = require('find-free-port')
var ipcMain = require('electron').ipcMain

var rpc = require('../../daemon').rpc

module.exports = function (win) {
  fp(5000, (err, port) => {
    if (err) throw err
    console.log('rpc port: ' + port)
    rpc({host: '127.0.0.1', port})
    ipcMain.on('rpc', (event, arg) => {
      event.sender.send('rpc', port)
    })
  })
}

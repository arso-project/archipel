var fp = require('find-free-port')
var ipcMain = require('electron').ipcMain

var server = require('@archipel/backend/server')
var config = require('@archipel/backend/config')

module.exports = function (done) {
  fp(5000, (err, port) => {
    if (err) throw err
    config.server.port = port
    config.server.host = '127.0.0.1'
    server(config, ({ server }) => {
      let websocketUrl = 'ws://' + config.server.host + ':' + port + '/api'
      done(websocketUrl)
      // ipcMain.on('rpc', (event, arg) => {
        // event.sender.send('rpc', port)
      // })
    })
  })
}

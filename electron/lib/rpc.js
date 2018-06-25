const dnode = require('dnode')
const { ipcMain } = require('electron')

function rpc (api) {
  ipcMain.on('init', (event, arg) => {
    let d = dnode(api)

    d.on('data', (data) => {
      event.sender.send('dnode', data)
    })

    ipcMain.on('dnode', (event, data) => {
      d.write(data)
    })

    event.sender.send('init')
  })
}

module.exports = rpc

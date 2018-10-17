'use strict'

// const { app, session, shell, BrowserWindow, Menu } = require('electron')
const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')
// const defaultMenu = require('electron-default-menu')

const archipel = require('./lib/archipel.js')

const isDev = process.env.NODE_ENV === 'development'

const pathPrefix = process.env.ARCHIPEL_APP_PATH || isDev ? path.join(__dirname, '../app') : __dirname

// const menu = defaultMenu(app, shell)
// menu[menu.length - 1].submenu.push({
//   label: 'Doctor',
//   click: () => {
//     win.webContents.openDevTools({ mode: 'detach' })
//   }
// })

let win

app.on('ready', () => {
  // var cspHeader = {'Content-Security-Policy': `default-src: 'self'`}
  // session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  //   callback({cancel: false, responseHeaders: Object.assign({}, details.responseHeaders, cspHeader)})
  // })

  win = new BrowserWindow({
    // Extending the size of the browserwindow to make sure that the developer bar is visible.
    width: 800 + (isDev ? 50 : 0),
    height: 600 + (isDev ? 200 : 0),
    titleBarStyle: 'hiddenInset',
    minWidth: 640,
    minHeight: 395,
    backgroundColor: 'white',
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, './preload.js')
    }
  })
  if (isDev) {
    require('./lib/development.js')(app, win)
  }
  win.loadURL(`file://${pathPrefix}/assets/index.html`)

  // Menu.setApplicationMenu(Menu.buildFromTemplate(menu))
  Menu.setApplicationMenu(null)

  archipel(win)

  if (isDev) {
    win.webContents.openDevTools()
  }
})

app.on('will-finish-launching', () => {
  app.on('open-url', (_, url) => win.webContents.send('link', url))
  app.on('open-file', (_, path) => win.webContents.send('file', path))
})

app.on('window-all-closed', () => {
  app.quit()
})

const quit = app.makeSingleInstance(() => {
  if (!win) return
  if (win.isMinimized()) win.restore()
  win.focus()
})

if (quit) app.quit()

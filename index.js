'use strict'

const { app, BrowserWindow, shell, Menu, ipcMain } = require('electron')
const defaultMenu = require('electron-default-menu')
const path = require('path')
const isDev = process.env.NODE_ENV === 'development'

const menu = defaultMenu(app, shell)
menu[menu.length - 1].submenu.push({
  label: 'Doctor',
  click: () => {
    win.webContents.openDevTools({ mode: 'detach' })
  }
})

let win
let watchProcess

app.on('ready', () => {
  if (isDev) {
    loadDevtools()
    watchAndReload()
  }
  win = new BrowserWindow({
    // Extending the size of the browserwindow to make sure that the developer bar is visible.
    width: 800 + (isDev ? 50 : 0),
    height: 600 + (isDev ? 200 : 0),
    titleBarStyle: 'hiddenInset',
    minWidth: 640,
    minHeight: 395,
    backgroundColor: '#eee',
    webPreferences: {
      nodeIntegration: false,
      preload: `${__dirname}/preload.js`
    }
  })
  win.loadURL(`file://${__dirname}/index.html`)
  Menu.setApplicationMenu(Menu.buildFromTemplate(menu))

  ipcMain.on('progress', (_, progress) => win && win.setProgressBar(progress))

  if (isDev) {
    win.webContents.openDevTools()
  } else {
  }
})

app.on('will-finish-launching', () => {
  app.on('open-url', (_, url) => win.webContents.send('link', url))
  app.on('open-file', (_, path) => win.webContents.send('file', path))
})

app.on('window-all-closed', () => {
  if (watchProcess) {
    watchProcess.close()
    watchProcess = null
  }
  app.quit()
})

const quit = app.makeSingleInstance(() => {
  if (!win) return
  if (win.isMinimized()) win.restore()
  win.focus()
})

if (quit) app.quit()

function loadDevtools () {
  const { default: installExtension, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } = require('electron-devtools-installer');

  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err))

  installExtension(REDUX_DEVTOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err))
}

function watchAndReload () {
  let gaze
  let first = true
  try {
    gaze = require('gaze')
  } catch (e) {
    console.warn('Gaze is not installed, wont be able to reload the app')
    // In case dev dependencies are not installed
    return
  }
  gaze([
    `preload.js`,
    `static/**/*`
  ], {
    debounceDelay: 60,
    cwd: __dirname
  }, (err, process) => {
    if (err) {
      console.warn('Gaze doesnt run well, wont be able to reload the app')
      console.warn(err)
      return
    }
    watchProcess = process
    watchProcess.on('all', () => {
      if (first) {
        first = false
        return
      }
      win && win.reload()
    })
  })
}

const path = require('path')

let watchProcess
let win

function initDev (app, mainWin) {
  console.log('Developer mode enabled.')
  win = mainWin
  loadDevtools()
  watchAndReload()

  app.on('window-all-closed', () => {
    if (watchProcess) {
      watchProcess.close()
      watchProcess = null
    }
  })
}

module.exports = initDev

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
  const cwd = path.join(__dirname, '../../')
  const watchList = [
    `electron/preload.js`,
    `dist/electron/**`
  ]

  let gaze
  try {
    gaze = require('gaze')
  } catch (e) {
    // In case dev dependencies are not installed
    console.warn('Gaze is not installed, wont be able to reload the app')
    return
  }

  gaze(watchList, { debounceDelay: 60, cwd: cwd }, (err, watcher) => {
    watchProcess = watcher
    if (err) {
      console.warn('Gaze doesnt run well, wont be able to reload the app', err)
    } else {
      watcher.on('changed', () => {
        console.log('Build files changed, reloading.')
        win && win.reload()
      })
    }
  })
}

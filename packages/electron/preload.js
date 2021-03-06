'use strict'
/**
 * This file exists for security reasons!
 *
 * It prepares by removing dangerous scripts from the global scopes
 * Before running the app.
 *
 * See: https://electronjs.org/docs/tutorial/security
 *    & https://eslint.org/docs/rules/no-implied-eval
 */
const isDev = process.env.NODE_ENV === 'development'
const path = require('path')
// todo: DRY in index.js
const pathPrefix = process.env.ARCHIPEL_APP_PATH || isDev ? path.join(__dirname, '../app') : __dirname

// eslint-disable-next-line no-eval
if (!isDev) {
  window.eval = global.eval = function () {
    throw new Error('Sorry, this app does not support window.eval().')
  }
}

const setTimeout = global.setTimeout
window.setTimeout = global.setTimeout = function (fn, ms) {
  if (typeof fn !== 'function') {
    throw new Error('Sorry, this app does not support setTimeout() with a string')
  }
  return setTimeout(fn, ms)
}
const setInterval = global.setInterval
window.setInterval = global.setInterval = function (fn, ms) {
  if (typeof fn !== 'function') {
    throw new Error('Sorry, this app does not support setInterval() with a string')
  }
  return setInterval(fn, ms)
}

const websocketUrl = process.argv.pop()
window.ARCHIPEL_WEBSOCKET_URL = websocketUrl

console.log('PRELOAD', process.argv)

// SETUP
// process.once('loaded', () => {
  // console.log('LOADED')
  // var ipc = require('electron').ipcRenderer
  // ipc.send('rpc')
  // ipc.on('rpc', (ev, port) => {
    // console.log('RPC!')
    // window.ARCHIPEL_WEBSOCKET_URL = 'ws://localhost:' + port + '/api'
  // })
  // document.addEventListener('DOMContentLoaded', () => {
    // var ipc = require('electron').ipcRenderer
    // ipc.send('rpc')
    // ipc.on('rpc', (ev, port) => {
      // window.ARCHIPEL_WEBSOCKET_URL = 'ws://localhost:' + port + '/api'
    // })
  // })
// })

if (isDev) {
  window.__devtron = {require: require, process: process}
  window.__devtron.require('devtron').install()
}

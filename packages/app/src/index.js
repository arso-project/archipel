import React from 'react'

import { createStore, applyMiddleware, compose } from 'redux'
import { Provider as StoreProvider } from 'react-redux'
import { combineReducers } from './redux-utils'

import thunk from 'redux-thunk'
import logger from 'redux-logger'

import PluginManager from './lib/plugin-manager'
import App from './features/app/App'

import app from './features/app'
import archive from './features/archive'
import fs from './features/fs'
import workspace from './features/workspace'

import ucore from 'ucore'
import ucoreRpc from 'ucore/rpc/client'
import ucoreStore from 'ucore/store'
import { Provider } from 'ucore/react'

const websocketUrl = window.location.origin.replace(/^http/, 'ws') + '/ucore'

const core = ucore()
core.register(ucoreRpc, { url: websocketUrl })
core.register(ucoreStore)
core.register(workspace)
core.register(archive)
core.register(fs)
core.ready((err) => {
  if (err) console.log('BOOT ERROR', err)
})

const archipel = new PluginManager()
archipel
  .use(app)
  .use(archive)
  .use(fs)
  .use(workspace)

// todo: this should be passed via a react context.
window.__archipelApp = archipel

let composeFunc = compose
let middleware = [thunk]

const reducer = combineReducers(archipel.getAll('duck'))

if (process.env.NODE_ENV === 'development') {
  middleware = [...middleware, logger]
  composeFunc = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || composeFunc
}

const store = createStore(
  reducer,
  composeFunc(applyMiddleware(...middleware))
)

const ArchipelApp = () => (
  <StoreProvider store={store}>
    <Provider core={core}>
      <App />
    </Provider>
  </StoreProvider>
)

export default ArchipelApp

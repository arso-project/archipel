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
    <App />
  </StoreProvider>
)

export default ArchipelApp

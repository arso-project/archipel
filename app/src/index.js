'use strict'

import React from 'react'

import { createStore, applyMiddleware, compose } from 'redux'
import { Provider as StoreProvider } from 'react-redux'

import thunk from 'redux-thunk'
import logger from 'redux-logger'

import ArchipelReducer from './reducers'
import App from './components/app'

let composeFunc = compose
let middleware = [thunk]

if (process.env.NODE_ENV === 'development') {
  middleware = [...middleware, logger]
  composeFunc = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || composeFunc
}

const store = createStore(
  ArchipelReducer,
  composeFunc(applyMiddleware(...middleware))
)

const ArchipelApp = () => (
  <StoreProvider store={store}>
    <App />
  </StoreProvider>
)

export default ArchipelApp

import React from 'react'

import { createStore, applyMiddleware, compose } from 'redux'
import { Provider as StoreProvider } from 'react-redux'
import { combineReducers } from './redux-utils'

import thunk from 'redux-thunk'
import logger from 'redux-logger'

// import ArchipelReducer from './reducers'
import AppDuck from './features/app/duck'
import ArchiveDuck from './features/archive/duck'
import WorkspaceDuck from './features/workspace/duck'

// import App from './components/app'
import App from './features/app/App'

let composeFunc = compose
let middleware = [thunk]

const ducks = [AppDuck, WorkspaceDuck, ArchiveDuck]

const reducer = combineReducers(ducks)

if (process.env.NODE_ENV === 'development') {
  // middleware = [...middleware, logger]
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

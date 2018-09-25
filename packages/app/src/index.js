import React from 'react'

import { createStore, applyMiddleware, compose } from 'redux'
import { Provider as StoreProvider } from 'react-redux'

import thunk from 'redux-thunk'
import logger from 'redux-logger'

// import ArchipelReducer from './reducers'
import ArchiveDuck from './features/archive/duck'
import WorkspaceDuck from './features/workspace/duck'

// import App from './components/app'
import App from './App'

let composeFunc = compose
let middleware = [thunk]

const ducks = [WorkspaceDuck, ArchiveDuck]

const combineReducers = (ducks) => {
  const reducers = ducks.map(duck => duck.reducer).filter(reducer => reducer)
  return function (state, action) {
    if (!state) state = {}
    state = reducers.reduce((state, reducer) => {
      state = reducer(state, action)
      return state
    }, state)
    return state
  }
}

const reducer = combineReducers(ducks)

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

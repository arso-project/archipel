'use strict'

import React from 'react'
import { render } from 'react-dom'

import { Provider as StoreProvider } from 'react-redux'
import { createStore, applyMiddleware, compose } from 'redux'

import thunk from 'redux-thunk'
import logger from 'redux-logger'

import { Provider as ThemeProvider } from 'rebass'

import { injectGlobal } from 'styled-components'

import ArchipelApp from './reducers'
import AppContainer from './containers/app'
import theme from './theme'

// Inject required styles.
injectGlobal`
  * { box-sizing: border-box; }
  body { margin: 0; }
`

// Redux devtools are added in preload.js only if in dev mode.

let composeFunc = compose
let middleware = [thunk]

if (process.env.NODE_ENV === 'development') {
  middleware = [...middleware, logger]
  composeFunc = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || composeFunc
}

const store = createStore(
  ArchipelApp,
  composeFunc(applyMiddleware(...middleware))
)

console.log('init')

render(
  <StoreProvider store={store}>
    <ThemeProvider theme={theme}>
      <AppContainer theme={theme} />
    </ThemeProvider>
  </StoreProvider>,
  document.querySelector('div')
)

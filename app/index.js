'use strict'

import React from 'react'
import { render } from 'react-dom'

import { Provider as StoreProvider } from 'react-redux'
import { createStore, applyMiddleware, compose } from 'redux'
import logger from 'redux-logger'
import thunk from 'redux-thunk'

import { Provider as ThemeProvider } from 'rebass'

import { injectGlobal } from 'styled-components'

import ArchipelApp from './reducers'
import AppContainer from './containers/app'

// Inject required styles.
injectGlobal`
  * { box-sizing: border-box; }
  body { margin: 0; }
`

// Redux devtools are added in preload.js only if in dev mode.
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const store = createStore(
  ArchipelApp,
  composeEnhancers(applyMiddleware(
    thunk,
    logger
  ))
)

render(
  <StoreProvider store={store}>
    <ThemeProvider>
      <AppContainer />
    </ThemeProvider>
  </StoreProvider>,
  document.querySelector('div')
)

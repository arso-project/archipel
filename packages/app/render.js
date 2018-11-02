import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'ucore/react'

import { App, makeCore } from './src/index.js'

import extensions from '../../extensions'

const core = makeCore(extensions)
core.ready()

render(
  <Provider core={core}>
    <App />
  </Provider>,
  document.querySelector('div')
)

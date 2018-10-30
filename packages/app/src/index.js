import React from 'react'

import App from './features/app/App'

import { Provider } from 'ucore/react'
import core from './core'

window.archipel = { core }

const ArchipelApp = () => (
  <Provider core={core}>
    <App />
  </Provider>
)

export default ArchipelApp

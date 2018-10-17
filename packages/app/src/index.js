import React from 'react'

import PluginManager from './lib/plugin-manager'
import App from './features/app/App'

import app from './features/app'
import archive from './features/archive'
import fs from './features/fs'
import workspace from './features/workspace'

import { Provider } from 'ucore/react'
import core from './core'

const archipel = new PluginManager()
archipel
  .use(app)
  .use(archive)
  .use(fs)
  .use(workspace)

// todo: this should be passed via a react context.
window.__archipelApp = archipel

const ArchipelApp = () => (
  <Provider core={core}>
    <App />
  </Provider>
)

export default ArchipelApp

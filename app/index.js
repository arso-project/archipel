import React from 'react'
import { render } from 'react-dom'

import ArchipelApp from './src/index.js'

import globalStyles from './src/theme/global.js'

import 'archipel-ui/tailwind.pcss'

globalStyles()

render(
  <ArchipelApp />,
  document.querySelector('div')
)

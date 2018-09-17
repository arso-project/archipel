import React from 'react'
import { render } from 'react-dom'

import ArchipelApp from './src/index.js'

import '@archipel/ui/tailwind.pcss'

render(
  <ArchipelApp />,
  document.querySelector('div')
)

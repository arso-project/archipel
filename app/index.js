import React from 'react'
import { render } from 'react-dom'
import { injectGlobal } from 'styled-components'

import ArchipelApp from './src/index.js'

// Inject required global styles.
injectGlobal`
  * { box-sizing: border-box; }
  body { margin: 0; }
`

render(
  <ArchipelApp />,
  document.querySelector('div')
)

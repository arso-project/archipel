import React from 'react'
import { render } from 'react-dom'

import { App } from './src/index.js'

import extensions from '../../extensions'

run()

function run () {
  render(
    <App extensions={extensions} />,
    document.querySelector('div')
  )
}

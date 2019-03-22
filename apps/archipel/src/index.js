import React from 'react'
import { render } from 'react-dom'

import { App } from '@archipel/app'

import extensions from '../extensions'

run()

function run () {
  render(
    <App extensions={extensions} />,
    document.querySelector('div')
  )
}

import React from 'react'
import ReactDOM from 'react-dom'

import { Button } from '../src/index.js'

import './index.pcss'

const App = () => (
  <div>
    <h2>Styleguide</h2>
    <Button>Hello, world!</Button>
  </div>
)

ReactDOM.render(<App />, document.getElementById('app'))

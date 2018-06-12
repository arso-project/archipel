'use strict'

import React from 'react'

import { Button } from 'rebass'

const App = ({title, counter, clickIncrement}) => (
  <div>
    <h1>{title}</h1>
    <p>Count: {counter}</p>
    <Button onClick={clickIncrement}>Increment</Button>
  </div>
)

export default App

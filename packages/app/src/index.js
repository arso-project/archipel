import React from 'react'
import AppComponent from './features/app/App'
import ApiTest from './features/app/ApiTest'

import '@archipel/ui/tailwind.pcss'

export const App = props => {
  return (
    <div>
      <ApiTest />
      <AppComponent />
    </div>
  )
}

export { default as makeCore } from './core'

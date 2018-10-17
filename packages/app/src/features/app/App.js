import React from 'react'

import { ScreenRender, ScreenSwitcher } from './ScreenController.js'
import SelectWorkspace from '../workspace/SelectWorkspace.js'

const Header = ({ children }) => (
  <div className='p-2 bg-dark text-bright text-xs w-full h-8'>
    <div className='flex justify-between'>
      {children}
    </div>
  </div>
)

const Footer = ({ children }) => (
  <div className='p-2 bg-dark text-bright text-xs w-full h-8'>{children}</div>
)

class App extends React.Component {
  constructor () {
    super()
    this.state = { archive: null }
  }

  render () {
    return <div className='h-screen flex flex-col font-sans'>
      <Header>
        <div className=''><ScreenSwitcher /></div>
        <div className='text-orange font-bold'>Archipel: Somoco</div>
        <div className=''><SelectWorkspace /></div>
      </Header>
      <div className='flex-1'>
        <ScreenRender />
      </div>
      <Footer>Footer</Footer>
    </div>
  }
}

export default App

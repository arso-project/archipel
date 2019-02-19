import React from 'react'
import { IconContext } from 'react-icons'

import { ScreenRender, ScreenSwitcher } from './ScreenController.js'
// import SelectWorkspace from '../workspace/SelectWorkspace.js'

const Header = ({ children, show }) => (
  <div className={'px-4 py-3 w-full h-10 border-b-2 leading-none ' + (!show ? 'hidden' : '')}>
    <div className='flex justify-between'>
      {children}
    </div>
  </div>
)

const Footer = ({ children, show }) => (
  <div className={'px-4 py-3 w-full h-10 border-t-2 leading-none ' + (!show ? 'hidden' : '')}>
    {children}
  </div>
)

class App extends React.Component {
  constructor () {
    super()
    this.state = { archive: null, chrome: true }
    this.onKeydown = this.onKeydown.bind(this)
  }

  onKeydown (e) {
    if (e.code === 'KeyS' && e.altKey) {
      this.setState({ chrome: !this.state.chrome })
    }
  }

  componentDidMount () {
    document.addEventListener('keydown', this.onKeydown, false)
  }

  componentWillUnmount () {
    document.removeEventListener('keydown', this.onKeydown, false)
  }

  render () {
    return (
      <div className='h-screen flex flex-col font-sans'>
        <IconContext.Provider value={{ style: { verticalAlign: 'middle', marginRight: '5px' } }}>
          <Header show={this.state.chrome} >
            {/* <div className=''><ScreenSwitcher /></div> */}
            <div className='font-bold'>Archipel: Somoco</div>
            {/* <div className=''><SelectWorkspace /></div> */}
          </Header>
          <div className='flex-1 flex flex-col overflow-y-scroll'>
            <ScreenRender chrome={this.state.chrome} />
          </div>
          <Footer show={this.state.chrome}>Footer</Footer>
        </IconContext.Provider>
      </div>
    )
  }
}

export default App

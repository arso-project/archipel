import React from 'react'

import ArchiveScreen from '../archive/ArchiveScreen.js'
import { Consumer } from 'ucore/react'

const Screens = {
  archives: ArchiveScreen
}

const Screen = (props) => {
  const screen = props.screen
  if (!Screens[screen]) return <div>Invalid screen: {screen}</div>
  const Render = Screens[screen]
  return <Render {...props} />
}

class ScreenSelect extends React.Component {
  render () {
    const { screen, setScreen } = this.props
    return <select value={screen} onChange={(e) => setScreen(e.target.value)} className=''>
      { Object.keys(Screens).map((op) => <option key={op} value={op}>{op}</option>)}
    </select>
  }
}

export const ScreenRender = (props) => (
  <Consumer store='app' chrome={props.chrome}>
    {({ screen }, { setScreen }) => <Screen {...props} screen={screen} setScreen={setScreen} />}
  </Consumer>
)

export const ScreenSwitcher = () => (
  <Consumer store='app'>
    {({ screen }, { setScreen }) => <ScreenSelect screen={screen} setScreen={setScreen} />}
  </Consumer>
)

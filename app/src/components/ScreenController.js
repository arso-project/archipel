import React from 'react'
import { connect } from 'react-redux'

import WelcomeScreen from './screens/Welcome'
import DebugScreen from './screens/Debug'
import SelectArchive from './screens/SelectArchive'
import ShowArchive from './screens/ShowArchive'

const Screens = {
  welcome: WelcomeScreen,
  select: SelectArchive,
  show: ShowArchive,
  debug: DebugScreen
}

const Screen = (props) => {
  const screen = props.screen
  if (!Screens[screen]) return <div>Invalid screen: {screen}</div>
  const Render = Screens[screen]
  return <Render {...props} />
}

class ScreenController extends React.Component {
  render () {
    const { screen, setScreen } = this.props
    return <Screen screen={screen} setScreen={setScreen} />
  }
}

class ScreenSelect extends React.Component {
  render () {
    const { screen, setScreen } = this.props
    return <select value={screen} onChange={(e) => setScreen(e.target.value)} className='px-2 py-3 my-0 mx-2 border-1 border-gray bg-black text-white'>
      { Object.keys(Screens).map((op) => <option key={op} value={op}>{op}</option>)}
    </select>
  }
}

const mapStateToProps = (state, props) => ({
  screen: state.ui.screen
})

const mapDispatchToProps = (dispatch) => ({
  setScreen: (screen) => dispatch({ type: 'SET_UI_SCREEN', screen })
})

export const ScreenRender = connect(mapStateToProps, mapDispatchToProps)(ScreenController)
export const ScreenSwitcher = connect(mapStateToProps, mapDispatchToProps)(ScreenSelect)

import React from 'react'
import { connect } from 'react-redux'

import ListArchivesScreen from '../archive/Screen.js'

const Screens = {
  listArchives: ListArchivesScreen
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
    return <select value={screen} onChange={(e) => setScreen(e.target.value)} className=''>
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

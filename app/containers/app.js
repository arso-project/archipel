'use strict'

import { connect } from 'react-redux'
import { setTitle, increment, fooAction, streamingAction } from '../actions'
import App from '../components/app'

const mapStateToProps = (state, props) => {
  return {
    title: state.title,
    counter: state.counter,
    theme: props.theme
  }
}

const mapDispatchToProps = dispatch => ({
  setTitle: (title) => dispatch(setTitle(title)),
  clickIncrement: () => dispatch(increment()),
  doStreamingTest: (str) => dispatch(streamingAction(str)),
  doFooTest: (str) => dispatch(fooAction(str))
})

const AppContainer = connect(mapStateToProps, mapDispatchToProps)(App)

export default AppContainer

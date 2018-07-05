'use strict'

import { connect } from 'react-redux'
import { setTitle, increment, fooAction, streamingAction, streamingAction2, queryAction } from '../actions'
import App from '../components/app'

const mapStateToProps = (state, props) => {
  return {
    title: state.title,
    theme: props.theme
  }
}

const mapDispatchToProps = dispatch => ({
  setTitle: (title) => dispatch(setTitle(title)),
  doStreamingTest: (str) => dispatch(streamingAction(str)),
  doStreamingTest2: (str) => dispatch(streamingAction2(str)),
  doFooTest: (str) => dispatch(fooAction(str)),
  doQuery: (key, q) => dispatch(queryAction(key, q))
})

const AppContainer = connect(mapStateToProps, mapDispatchToProps)(App)

export default AppContainer

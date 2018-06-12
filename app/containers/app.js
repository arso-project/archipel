'use strict'

import { connect } from 'react-redux'
import { setTitle, increment } from '../actions'
import App from '../components/app'

const mapStateToProps = state => ({
  title: state.title,
  counter: state.counter
})

const mapDispatchToProps = dispatch => ({
  setTitle: (title) => dispatch(setTitle(title)),
  clickIncrement: () => dispatch(increment())
})

const AppContainer = connect(mapStateToProps, mapDispatchToProps)(App)

export default AppContainer

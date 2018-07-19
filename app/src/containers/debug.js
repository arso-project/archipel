'use strict'

import { connect } from 'react-redux'
import { setTitle, query, foo, perftest } from '../actions'
import App from '../components/debug'

const mapStateToProps = (state, props) => {
  return {
    title: state.title,
    theme: props.theme
  }
}

const mapDispatchToProps = dispatch => ({
  setTitle: (title) => dispatch(setTitle(title)),
  doPerftest: (type, id) => (e) => dispatch(perftest(type, id)),
  doFooTest: (str) => dispatch(foo(str)),
  doQuery: (key, q) => dispatch(query(key, q))
})

const DebugContainer = connect(mapStateToProps, mapDispatchToProps)(App)

export default DebugContainer

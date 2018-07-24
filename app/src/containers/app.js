'use strict'

import { connect } from 'react-redux'
import { loadArchives } from '../actions'
import App from '../components/app'

const mapStateToProps = (state, props) => {
  return {
    title: state.title,
    archives: state.archives,
    screen: state.ui.screen
  }
}

const mapDispatchToProps = dispatch => ({
  loadArchives: () => dispatch(loadArchives())
})

const AppContainer = connect(mapStateToProps, mapDispatchToProps)(App)

export default AppContainer

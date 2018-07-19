import React from 'react'
import DebugContainer from '../containers/debug'
import Main from './ui/main'

class App extends React.Component {
  componentDidMount () {
    this.props.loadArchives();
  }
  render () {
    // return <Main archives={this.props.archives} />
    return <DebugContainer />
  }
}

export default App

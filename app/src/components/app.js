import React from 'react'
// import DebugContainer from '../containers/debug'
import MainContent from './ui/main'

const Header = ({children}) => (
  <div className='p-2 bg-dark text-bright text-sm w-full h-8'>{children}</div>
)

const Footer = ({children}) => (
  <div className='p-2 bg-dark text-bright text-sm w-full h-8'>{children}</div>
)

class App extends React.Component {
  componentDidMount () {
    this.props.loadArchives()
  }
  render () {
    return <div className='h-screen flex flex-col font-sans'>
      <Header>Header</Header>
      <div className='flex-1'>
        <MainContent />
      </div>
      <Footer>Footer</Footer>
    </div>
    // return <Main archives={this.props.archives} />
    // return <DebugContainer />
  }
}

export default App

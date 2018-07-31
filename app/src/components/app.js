import React from 'react'
// import DebugContainer from '../containers/debug'
import MainContent from './ui/main'

const Header = ({children}) => (
  <div className='p-2 bg-dark text-bright text-xs w-full h-8 flex justify-between'>{children}</div>
)

const Footer = ({children}) => (
  <div className='p-2 bg-dark text-bright text-xs w-full h-8'>{children}</div>
)

class App extends React.Component {
  componentDidMount () {
    this.props.loadArchives()
  }
  render () {
    const { archives } = this.props
    return <div className='h-screen flex flex-col font-sans'>
      <Header>
        <div className=''>Header</div>
        <div className='text-orange font-bold'>Archipel: Somoco</div>
        <div className=''>Choose Workspace</div>
      </Header>
      <div className='flex-1'>
        <MainContent archives={archives} />
      </div>
      <Footer>Footer</Footer>
    </div>
    // return <Main archives={this.props.archives} />
    // return <DebugContainer />
  }
}

export default App

import React from 'react'
import { connect } from 'react-redux'

import { init } from '../actions/index.js'
import { ScreenRender, ScreenSwitcher } from './ScreenController.js'
import SelectWorkspace from './widgets/SelectWorkspace.js'

const Header = ({children}) => (
  <div className='p-2 bg-dark text-bright text-xs w-full h-8 flex justify-between'>{children}</div>
)

const Footer = ({children}) => (
  <div className='p-2 bg-dark text-bright text-xs w-full h-8'>{children}</div>
)

class App extends React.Component {
  componentDidMount () {
    this.props.init()
  }
  render () {
    return <div className='h-screen flex flex-col font-sans'>
      <Header>
        <div className='flex'>
          Header
          <ScreenSwitcher />
        </div>
        <div className='text-orange font-bold'>Archipel: Somoco</div>
        <div className='flex'><SelectWorkspace /></div>
      </Header>
      <div className='flex-1'>
        <ScreenRender />
      </div>
      <Footer>Footer</Footer>
    </div>
  }
}

const mapStateToProps = (state, props) => {
  return {}
}

const mapDispatchToProps = dispatch => ({
  init: () => dispatch(init())
})

export default connect(mapStateToProps, mapDispatchToProps)(App)

// import React from 'react'
// import MainScreen from './screens/Welcome'
// import DebugScreen from '../containers/debug'
// import SelectArchive from './screens/SelectArchive'

// const Screens = {
//   main: MainScreen,
//   select: SelectArchive,
//   debug: DebugScreen
// }

// const Screen = (props) => {
//   const screen = props.screen
//   if (!Screens[screen]) return <div>Invalid screen: {screen}</div>
//   const Render = Screens[screen]
//   return <Render {...props} />
// }

// const Header = ({children}) => (
//   <div className='p-2 bg-dark text-bright text-xs w-full h-8 flex justify-between'>{children}</div>
// )

// const Footer = ({children}) => (
//   <div className='p-2 bg-dark text-bright text-xs w-full h-8'>{children}</div>
// )


// class App extends React.Component {
//   componentDidMount () {
//     this.props.init()
//   }
//   render () {
//     const { workspaces, workspace, archives, screen, setScreen, setWorkspace, createArchive } = this.props
//     return <div className='h-screen flex flex-col font-sans'>
//       <Header>
//         <div className='flex'>
//           Header
//           <select value={screen} onChange={(e) => setScreen(e.target.value)} className='px-2 py-3 my-0 mx-2 border-1 border-gray bg-black text-white'>
//             { Object.keys(Screens).map((op) => <option key={op} value={op}>{op}</option>)}
//           </select>
//         </div>
//         <div className='text-orange font-bold'>Archipel: Somoco</div>
//         <div className='flex'><Workspaces workspaces={workspaces} workspace={workspace} setWorkspace={setWorkspace} /></div>
//       </Header>
//       <div className='flex-1'>
//         <Screen screen={screen} archives={archives} createArchive={createArchive} />
//       </div>
//       <Footer>Footer</Footer>
//     </div>
//     // return <Main archives={this.props.archives} />
//     // return <DebugContainer />
//   }
// }

// export default App

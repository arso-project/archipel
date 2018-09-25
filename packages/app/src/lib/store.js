import rpc from './rpc.js'
// import Stat from 'hyperdrive/lib/stat.js'
import React from 'react'

const Context = React.createContext(null)

// export const Consumer = props => <Context.Consumer {...props} />

export const WithStore = props => <Context.Consumer {...props} />

export class ArchipelStoreProvider extends React.Component {
  constructor () {
    super()
    this.store = null
    this.state = {}
  }

  componentDidMount () {
    const self = this
    createStore().then(store => {
      self.store = store()
      self.setState({loaded: true})
    }).catch(e => {
      self.setState({error: e.message})
    })
  }

  render () {
    if (this.state.error) return <div>Error: {this.state.error}</div>
    if (!this.store) return <div>Loading...</div>

    const value = {
      getStore: () => this.store
    }

    return (
      <Context.Provider value={value}>
        {this.props.children}
      </Context.Provider>
    )
  }
}

// export const connect = Component => props => {
//   console.log('in connect', props)
//   return (
//     <Consumer>
//       {maybeState => maybeState ? (
//         <Component {...props} {...maybeState} />
//       ) : (
//         <Provider {...props}>
//           <Consumer>
//             {state => (
//               <Component {...props} {...state} />
//             )}
//           </Consumer>
//         </Provider>
//       )}
//     </Consumer>
//   )
// }

export function createStore () {
  let state = {}
  return new Promise((resolve, reject) => {
    rpc(async (api) => {
      const rootspace = await api.rootspace()
      let workspace
      if (window.localStorage.archipelWorkspace) {
        workspace = await rootspace.getWorkspace(window.localStorage.archipelWorkspace)
      }
      if (!workspace) {
        workspace = await rootspace.getDefaultWorkspace()
      }
      state = { rootspace, workspace }
      resolve(store)
      function store () {
        function setState (newState) {
          state = newState
        }

        function getState () {
          return state
        }

        return {
          setState,
          getState
        }
      }
    })
  })
}

class Archive extends React.Component {
  constructor () {
    super()
    this.state = {
      status: 'loading'
    }
    this.archive = null
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    if (this.props.archive !== prevProps.archive) {
      this.setState({status: 'loading'})
      this.fetch()
    }
  }

  componentDidMount () {
    this.fetch()
  }

  fetch () {
    const { archive, getStore } = this.props
    const st = getStore().getState()
    const self = this

    if (!archive) return this.setState({ ...this.state, status: 'error', error: 'No key.' })

    fetchArchive(archive)

    async function fetchArchive (key) {
      try {
        if (!st.workspace) return self.setState({ ...self.state, status: 'error', error: 'Not workspace.' })
        if (!st.archives) st.archives = {}
        if (!st.archives[key]) st.archives[key] = await st.workspace.archive(key)
        if (!st.archives[key]) return self.setState({ ...self.state, status: 'error', error: 'Not found.' })
        getStore().setState(st)
        // const archive = st.archives[key]
        // console.log('in fetch', self.archive)
        const archive = st.archives[key]
        const fs = await archive.fs()
        const graph = await archive.graph()
        self.setState({
          ...self.state,
          status: 'complete',
          getArchive: () => archive,
          getFs: () => fs,
          getGraph: () => graph
        })
      } catch (e) {
        console.log(e)
        self.setState({...self.state, status: 'error', error: e.message})
      }
    }
  }

  render () {
    const { error, loading, complete, ...rest } = this.props
    const props = {...rest, ...this.state}
    switch (this.state.status) {
      case 'error': return error(props)
      case 'loading': return loading(props)
      case 'complete': return complete(props)
    }
  }
}

export const WithArchive = props => (
  <WithStore>
    {({getStore}) => <Archive {...props} getStore={getStore} />}
  </WithStore>
)

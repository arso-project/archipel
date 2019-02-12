import React from 'react'
import shallowEqual from 'shallowequal'

function isEmpty (obj) {
  if (!obj) return true
  if (Array.isArray(obj) && !obj.length) return true
  if (typeof obj === 'object' && Object.getOwnPropertyNames(obj).length === 0) return true
  return false
}

const cleanProps = (props) => {
  let {
    children,
    store,
    select,
    fetch,
    fetchOnResult,
    fetchOnChange,
    ...rest
  } = props
  return rest
}

export class Subscriber extends React.Component {
  constructor (props) {
    super()
    this.onStoreChange = this.onStoreChange.bind(this)
    this.fetchOnResult = props.fetchOnResult || isEmpty
    const sel = props.store.select(props.select, cleanProps(props))
    this.state = { sel }
  }

  componentDidMount () {
    this.subscribe(this.state.sel)
  }

  subscribe (currentSel) {
    let cleanedProps = cleanProps(this.props)

    if (this.unsubscribe) this.unsubscribe()
    this.unsubscribe = this.props.store.subscribe(this.onStoreChange, this.props.select, cleanedProps, true)

    if (this.props.fetch) {
      if (this.fetchOnResult(currentSel)) this.props.store.actions[this.props.fetch](cleanedProps)
    }
  }

  componentWillUnmount () {
    this.willUnmount = true
    this.unsubscribe()
  }

  onStoreChange (sel) {
    if (!this.willUnmount) this.setState({ sel })
  }

  shouldComponentUpdate (nextProps, nextState) {
    // Always update on prop change.
    if (!shallowEqual(cleanProps(this.props), cleanProps(nextProps))) return true
    // Never update if state is the same.
    if (shallowEqual(this.state.sel, nextState.sel)) return false
    return true
  }

  componentDidUpdate (prevProps, prevState) {
    prevProps = cleanProps(prevProps)
    const props = cleanProps(this.props)
    let resubscribe = false
    // Component was updated. This might mean that the query was changed. If so, resubscribe and update selection.
    // First check refetchOnChange prop, either a function or an object to compare.
    if (this.props.fetchOnChange) {
      if (this.props.fetchOnChange === true) resubscribe = !shallowEqual(prevProps, props)
      if (typeof this.props.fetchOnChange === 'function') resubscribe = this.props.fetchOnChange()
      else if (!shallowEqual(prevProps.fetchOnChange, this.props.fetchOnChange)) resubscribe = true
    } else resubscribe = !shallowEqual(prevProps, props)

    if (resubscribe) {
      const sel = this.props.store.select(this.props.select, props)
      this.setState({ sel })
      this.subscribe(sel)
    }
  }

  render () {
    const { children, store } = this.props
    const { sel } = this.state
    return typeof children === 'function' ? children(sel, store) : children
  }
}


const Context = React.createContext()

export const Provider = ({ core, children }) => (
  <Context.Provider value={core}>
    {children}
  </Context.Provider>
)

export class Consumer extends React.PureComponent {
  render () {
    const { store, ...rest } = this.props
    return (
      <WithCore>
        {(core => <Subscriber store={core.getStore(store)} {...rest} />)}
      </WithCore>
    )
  }
}

class AsyncCoreProxy extends React.PureComponent {
  componentDidMount () {
    if (!this.props.core.isReady) this.props.core.on('ready', () => this.forceUpdate())
  }

  render () {
    if (!this.props.core.isReady) return <div>Loading</div>
    return this.props.children(this.props.core)
  }
}

export class WithCore extends React.PureComponent {
  render () {
    let { children } = this.props
    return (
      <Context.Consumer>
        {core => {
          return core.isReady ? children(core) : <AsyncCoreProxy core={core} children={children} />
        }}
      </Context.Consumer>
    )
  }
}

export class WithStore extends React.PureComponent {
  render () {
    let { store, children } = this.props
    return (
      <WithCore>
        {core => {
          let realStore = core.getStore(store)
          return children(realStore)
        }}
      </WithCore>
    )
  }
}

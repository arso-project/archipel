import React from 'react'
import shallowEqual from 'shallowequal'

const { Consumer: NodeConsumer, Provider: NodeProvider } = React.createContext([])
const { Consumer: TreeConsumer, Provider: TreeProvider } = React.createContext({})

export { NodeConsumer, NodeProvider, TreeConsumer, TreeProvider }

const isFn = (fn) => typeof fn === 'function'

const actions = {
  init (state, path, props) {
    state.tree = setAndCopy(state.tree, path, props)
    return state
  },
  expand (state, path, props) {
    state.tree = setAndCopy(state.tree, path, node => {
      if (!node.expandable) return node
      return Object.assign({}, node, { expand: !node.expand })
    })
    return state
  },
  focus (state, path, props) {
    return toggle(state, path, 'focus')
  },
  select (state, path, props) {
    return toggle(state, path, 'select')
  }
}

function toggle (state, path, prop) {
  if (state[prop]) {
    state.tree = setAndCopy(state.tree, state[prop], { [prop]: false })
  }
  state.tree = setAndCopy(state.tree, path, { [prop]: true })
  state[prop] = path
  return state
}

export class Tree extends React.Component {
  constructor (props) {
    super(props)
    this.runAction = this.runAction.bind(this)
    this.setState = this.setState.bind(this)
    this.setPath = this.setPath.bind(this)
    this.getPath = this.getPath.bind(this)
    this.actions = actions
    this.actionQueue = []
    this.inits = []

    this.state = {
      tree: {},
      focus: null
    }

    const { runAction } = props
    if (runAction) runAction(this.runAction.bind(this))
  }

  setPath (path, value, cb) {
    let state = this.state
    let tree = setAndCopy(this.state.tree, [...path], value)
    state.tree = tree
    this.setState({ ...state }, cb)
  }

  getPath (path) {
    let value = walk(this.state.tree, [...path])
    if (value === undefined) value = {}
    return value
  }

  runAction (name, path, props) {
    this.actionQueue.push([name, path, props])
    this.runActions()
  }

  runActions () {
    const self = this
    if (this.running) return
    this.running = true
    run()

    function run () {
      let state = self.state
      while (self.actionQueue.length) {
        let [name, path, props] = self.actionQueue.shift()
        let action = self.props.actions[name] || self.actions[name]
        state = action(state, path, props)
        if (name === 'select' && self.props.onSelect) {
          self.props.onSelect(self.getPath(path))
        }
      }
      self.setState({ ...state }, finish)
    }

    function finish () {
      if (self.actionQueue.length) run()
      else self.running = false
    }
  }

  runInits () {
    if (!this.inits.length) return
    let tree = this.state.tree
    this.inits.forEach(([path, props]) => {
      tree = setAndCopy(tree, path, props)
    })
    this.setState({ tree })
  }

  render () {
    const { children } = this.props

    const value = {
      state: this.state,
      setState: this.setState,
      runAction: this.runAction,
      getPath: this.getPath,
      setPath: this.setPath
    }

    return (
      <TreeProvider value={value}>
        {isFn(children) ? children(value) : children}
      </TreeProvider>
    )
  }
}

Tree.defaultProps = {
  actions: {}
}

export const TreeNode = (props) => {
  let { id, item, children, expandable } = props
  return (
    <TreeConsumer>
      {(treeState) => (
        <NodeConsumer>
          {(path) => {
            path = [...path, 'children', id]
            let state = treeState.getPath(path)
            let action = (name, props) => e => treeState.runAction(name, path, props)
            return (
              <NodeProvider value={path}>
                <PureTreeNode children={children} id={id} item={item} state={state} action={action} expandable={expandable} />
              </NodeProvider>
            )
          }}
        </NodeConsumer>
      )}
    </TreeConsumer>
  )
}

TreeNode.defaultProps = {
  expandable: true
}

Tree.Node = TreeNode

class PureTreeNode extends React.Component {
  shouldComponentUpdate (prevProps) {
    if (!shallowEqual(prevProps.state, this.props.state) ||
      !shallowEqual(prevProps.path, this.props.path) ||
      prevProps.item !== this.props.item) {
      return true
    }
    return false
  }

  componentDidMount () {
    const { id, item, expandable, action } = this.props
    action('init', { id, item, expandable })()
  }

  render () {
    const { children, id, item, path, state, action } = this.props
    return children({ id, item, path, state, action })
  }
}

export function walk (state, path) {
  let cur = state
  path.forEach(key => {
    if (cur === undefined) return undefined
    if (typeof cur[key] !== 'object') cur = undefined
    else cur = cur[key]
  })
  return cur
}

export function setAndCopy (state, path, valueOrFunction) {
  let cb
  if (typeof valueOrFunction !== 'function') cb = old => Object.assign({}, old, valueOrFunction)
  else cb = valueOrFunction

  let nextState = { ...state }

  if (!path.length) return cb(nextState)

  let oldPos = state
  let newPos = nextState
  path.forEach((key, idx) => {
    oldPos = oldPos[key] || {}

    if (idx === path.length - 1) newPos[key] = cb(oldPos)
    else newPos[key] = { ...oldPos }

    newPos = newPos[key]
  })
  return nextState
}

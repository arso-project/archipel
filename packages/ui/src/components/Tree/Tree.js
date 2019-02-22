import React, { useContext } from 'react'
import shallowEqual from 'shallowequal'

// const { Consumer: NodeConsumer, Provider: NodeProvider } = React.createContext([])
const { Consumer: TreeConsumer, Provider: TreeProvider } = React.createContext({})

// export { NodeConsumer, NodeProvider, TreeConsumer, TreeProvider }
const TreeContext = React.createContext()

export function useTree () {
  const context = useContext(TreeContext)
  return context
}
// export { TreeConsumer, TreeProvider }

const actions = {
  init (state, path, props) {
    state.tree = setAndCopy(state.tree, path, props)
    return state
  },
  expand (state, path, props) {
    state.tree = setAndCopy(state.tree, path, node => {
      // if (!node.expandable) return node
      let expand
      if (props !== undefined) expand = props
      else expand = !node.expand
      return Object.assign({}, node, { expand })
    })
    return state
  },
  focus (state, path, props) {
    return toggle(state, path, 'focus')
  },
  select (state, path, props) {
    return toggle(state, path, 'select')
  },
  zoom (state, path) {
    if (state.zoom === path || path === null || !path.length) {
      state.zoom = null
      state.tree = setAndCopy(state.tree, state.zoom, { zoom: null })
    } else {
      return toggle(state, path, 'zoom')
    }
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

  componentDidMount () {
    if (this.props.hideRoot) {
      let nodeId = this.props.getId(this.props.item)
      this.runAction('expand', [nodeId])
    }
    if (this.props.init) this.props.init(this.treeState())
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
        let newState = action(state, path, props)
        // console.log('tree action', { name, path, props, state, newState })
        state = newState
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

  treeState () {
    return {
      state: this.state,
      setState: this.setState,
      runAction: this.runAction,
      getPath: this.getPath,
      setPath: this.setPath,
      treeProps: this.props,
      getId: this.props.getId,
      renderNode: this.props.renderNode
    }
  }

  render () {
    let { children, item, wrap, renderNode, getId, ...props } = this.props
    renderNode = renderNode || children

    const treeState = {
      ...this.treeState()
    }

    let path = []
    if (this.state.zoom && this.state.zoom.length) {
      let zoomNode = walk(this.state.tree, this.state.zoom)
      item = zoomNode.item
      path = this.state.zoom.slice(0, -1)
    }

    let inner = <TreeNode item={item} parent={path} />

    if (wrap) {
      inner = wrap(treeState, inner)
    }

    return (
      <TreeContext.Provider value={treeState}>
        {inner}
      </TreeContext.Provider>
    )
  }
}

Tree.defaultProps = {
  actions: {}
}

export function TreeNode (props) {
  const treeState = useTree()
  let { id, item, parent, level } = props
  const { getId, getPath, runAction, renderNode, treeProps } = treeState
  if (!id && getId) id = getId(item)
  let path = [...parent, id]
  let state = getPath(path)
  return (
    <PureTreeNode id={id} path={path} item={item} state={state} runAction={runAction} renderNode={renderNode} level={level} treeProps={treeProps} />
  )
}

TreeNode.defaultProps = {
  parent: [],
  level: 0
}

Tree.Node = TreeNode

class PureTreeNode extends React.Component {
  shouldComponentUpdate (prevProps) {
    if (!shallowEqual(prevProps.state, this.props.state) ||
      !shallowEqual(prevProps.path, this.props.path) ||
      !shallowEqual(prevProps.item, this.props.item)) {
      return true
    }
    return false
  }

  componentDidMount () {
    const { id, item, path, runAction } = this.props
    runAction('init', path, { id, item })
  }

  render () {
    const { id, item, path, state, runAction, renderNode, level, treeProps } = this.props
    let action = (name, props) => e => runAction(name, path, props)
    const Node = props => <TreeNode {...props} parent={path} level={level + 1} />
    return renderNode({ id, path, item, state, action, level, Node, treeProps })
  }
}

function includeChildprop (path, childProp) {
  path = path.reduce((ret, cur) => {
    ret.push(childProp)
    ret.push(cur)
    return ret
  }, [])
  return path
}

export function walk (state, path) {
  let childProp = 'children'
  if (path.length) path = includeChildprop(path, childProp)
  else path = [childProp]
  let cur = state
  path.forEach(key => {
    if (cur === undefined) return undefined
    if (typeof cur[key] !== 'object') cur = undefined
    else cur = cur[key]
  })
  return cur
}

export function inBoundary (boundary, path) {
  if (path.length < boundary.length) return false
  let i = 0
  while (i < boundary.length) {
    if (boundary[i] !== path[i]) return false
    i++
  }
  return true
}

export function setAndCopy (state, path, valueOrFunction) {
  let cb
  if (typeof valueOrFunction !== 'function') cb = old => Object.assign({}, old, valueOrFunction)
  else cb = valueOrFunction

  let nextState = { ...state }

  if (!path || !path.length) return cb(nextState)
  path = includeChildprop(path, 'children')

  let oldPos = state
  let newPos = nextState
  path.forEach((key, idx) => {
    if (!oldPos[key]) oldPos[key] = {}
    oldPos = oldPos[key] || {}

    if (idx === path.length - 1) newPos[key] = cb(oldPos)
    else newPos[key] = { ...oldPos }

    newPos = newPos[key]
  })
  return nextState
}


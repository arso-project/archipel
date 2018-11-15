import React from 'react'
import scrollIntoView from 'scroll-into-view-if-needed'
import { MdZoomIn, MdCloudDownload, MdSelectAll, MdExpandMore, MdExpandLess } from 'react-icons/md'
import shallowEqual from 'shallowequal'

import './Tree.pcss'

const Button = ({ children, onClick, on }) => {
  let cls = 'rounded-full text-lg mr-1 cursor-pointer hover:bg-grey-light '
  if (on) cls += 'text-green-dark'
  return (
    <div onClick={onClick} className={cls}>
      {children}
    </div>
  )
}

class Tooltip extends React.Component {
  constructor (props) {
    super(props)
    this.state = { visible: false }
    this.onMouseEnter = this.onMouseEnter.bind(this)
    this.onMouseLeave = this.onMouseLeave.bind(this)
    this.el = React.createRef()
  }

  renderTooltip () {
    let { content, Content } = this.props
    if (typeof content === 'function') content = content(this.props)
    if (!Content) Content = () => <span>{content}</span>
    const classes = 'bg-black text-xs px-2 leading-normal py-1 rounded absolute text-grey-light max-w-xs'
    const bbox = this.el.current.getBoundingClientRect()
    // let width = 200
    const style = {
      width: 'auto',
      maxWidth: '200px',
      left: (bbox.left + (bbox.width / 2) - 50 / 2) + 'px',
      top: (bbox.top - 30) + 'px'
    }
    return (
      <div className={classes} style={style}>
        <Content />
      </div>
    )
  }

  onMouseEnter () {
    this.setState({ visible: true })
  }

  onMouseLeave () {
    this.setState({ visible: false })
  }

  componentWillUnmount () {
    if (this.timeout) clearTimeout(this.timeout)
  }

  render () {
    const { children } = this.props
    return (
      <React.Fragment>
        <div onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave} ref={this.el}>
          {children}
        </div>
        {this.state.visible && this.renderTooltip()}
      </React.Fragment>
    )
  }
}

class TreeNode extends React.Component {
  constructor (props) {
    super(props)
    this.debug = this.debug.bind(this)
    this.path = this.path.bind(this)
    this.el = React.createRef()
  }

  shouldComponentUpdate (nextProps) {
    if (!shallowEqual(nextProps.state, this.props.state)) {
      return true
    }
    return false
  }

  componentDidUpdate (prevProps) {
    if (!prevProps.state.focus && this.props.state.focus) {
      scrollIntoView(this.el.current, {
        behavior: 'smooth',
        scrollMode: 'if-needed',
        block: 'top',
        inline: 'top'
      })
    }
  }

  debug () {
    let { onAction, state } = this.props
    let path = this.path()
    let action = (name) => onAction(path, name)
    return (
      <div>
        <div className='flex'>
          <Button onClick={action('expand')} on={state.expand}>
            <Tooltip content={state.expand ? 'Collapse' : 'Expand'}>
              {state.expand && <MdExpandLess />}
              {!state.expand && <MdExpandMore />}
            </Tooltip>
          </Button>
          <Button onClick={action('select')} on={state.select}>
            <Tooltip content='Select'>
              <MdSelectAll />
            </Tooltip>
          </Button>
          <Button onClick={action('zoom')} on={state.zoom}>
            <Tooltip content='Zoom'>
              <MdZoomIn />
            </Tooltip>
          </Button>
          <Button onClick={action('fetch')} on={state.fetch}>
            <Tooltip content='Fetch children'>
              <MdCloudDownload />
            </Tooltip>
          </Button>
        </div>
      </div>
    )
  }

  path () {
    let { path, childProp, id } = this.props
    path = path.length ? [...path, childProp, id] : [id]
    return path
  }

  renderChildren (props) {
    let { children, node, childProp, depth, path, state, onAction } = this.props

    if (!state.expand) return null

    path = this.path()
    let nodes = node[childProp] || {}
    let nodesState = state[childProp] || {}

    return <Tree
      childProp={childProp}
      state={nodesState}
      children={children}
      nodes={nodes}
      depth={depth + 1}
      path={path}
      onAction={onAction}
    />
  }

  render () {
    let { children, node, depth, path, state, onAction } = this.props

    path = this.path()

    let debug = this.debug.bind(this)
    let action = (name) => onAction(path, name)
    // let tree = () => this.renderChildren()
    let tree = this.renderChildren()

    return (
      <div className='p-2 border-1 m-1'>
        <span ref={this.el} />
        {debug()}
        {/* {this.renderChildren()} */}
        <div>{children({ node, depth, path, state, debug, action, tree })}</div>
      </div>
    )
  }
}

TreeNode.defaultProps = {
  children: () => {},
  depth: 0,
  state: {},
  path: [],
  onAction: () => {}
}

class Tree extends React.PureComponent {
  render () {
    let { nodes, state, path, children, depth, onAction, childProp } = this.props

    nodes = nodes || {}
    state = state || {}

    return (
      <ul className='list-reset'>
        {Object.keys(nodes).map((id) => {
          let node = nodes[id]
          if (!node) return null
          let nodeState = state[id] ? state[id] : {}

          return (
            <TreeNode
              key={id}
              id={id}
              path={path}
              node={node}
              state={nodeState}
              children={children}
              depth={depth}
              onAction={onAction}
              childProp={childProp}
            />
          )
        })}
      </ul>
    )
  }
}

Tree.defaultProps = {
  nodes: {},
  state: {}
}

class TreeContainer extends React.Component {
  constructor (props) {
    super(props)
    this.onAction = this.onAction.bind(this)
    this.onKeydown = this.onKeydown.bind(this)
    this.state = {
      data: props.nodes,
      ui: {},
      select: [],
      zoom: [],
      focus: [],
      keyboardFocus: props.keyboardFocus
    }
  }

  async onKeydown (e) {
    if (!this.state.keyboardFocus) return
    if (e.key === 'ArrowDown') {
      this.changeFocus('down')
      e.preventDefault()
    }
    if (e.key === 'ArrowUp') {
      this.changeFocus('up')
      e.preventDefault()
    }
    if (e.key === 'ArrowRight') {
      this.changeFocus('in')
      e.preventDefault()
    }

    if (e.key === 'ArrowLeft') {
      this.changeFocus('out')
      e.preventDefault()
    }

    if (e.key === 'Enter' && this.state.focus.length) {
      this.onAction(this.state.focus, 'select')(e)
    }

    if (e.key === 'z' && this.state.focus.length) {
      this.onAction(this.state.focus, 'zoom')(e)
    }

    if (e.key === 'f' && this.state.focus.length) {
      this.onAction(this.state.focus, 'fetch')(e)
    }
  }

  componentDidMount () {
    document.addEventListener('keydown', this.onKeydown, false)
  }

  componentWillUnmount () {
    document.removeEventListener('keydown', this.onKeydown, false)
  }

  componentWillReceiveProps (props) {
    if (props.keyboardFocus !== this.state.keyboardFocus) {
      this.setState({ keyboardFocus: props.keyboardFocus })
    }
  }

  changeFocus (dir) {
    let { ui, data, focus, zoom } = this.state
    let { childProp } = this.props
    if (focus.length < zoom.length) return

    focus = focus || []

    let focusKey = focus.length ? focus[focus.length - 1] : null
    let nodeState = walkTree(ui, focus)
    let node = walkTree(data, focus)

    if (dir === 'up' || dir === 'down') {
      let parentPath = focus.length ? focus.slice(0, -1) : []
      let siblings = Object.keys(walkTree(data, parentPath))
      let idx = siblings.indexOf(focusKey)

      if (dir === 'down') idx++
      if (dir === 'up') idx--

      let found = false
      if (dir === 'up' && idx < 0 && parentPath.length) {
        focus = parentPath.slice(0, -1)
        found = true
      } else if (dir === 'down' && nodeState.expand && node[childProp] && Object.keys(node[childProp]).length) {
        focus = [...focus, childProp, Object.keys(node[childProp])[0]]
        found = true
      } else if (dir === 'down' && idx > siblings.length - 1) {
        let cur = [...parentPath]
        while (!found && cur.length) {
          let key = cur[cur.length - 2]
          cur = cur.slice(0, -2)
          let siblings = Object.keys(walkTree(data, cur))
          let idx = siblings.indexOf(key)
          if (siblings[idx + 1]) {
            found = true
            focus = [...cur, siblings[idx + 1]]
          }
        }
      }

      if (!found) {
        if (idx < 0) {
          idx = 0
        } else if (idx > siblings.length - 1) {
          idx = siblings.length - 1
        }
        focus = [...parentPath, siblings[idx]]
      }
    }

    if (dir === 'in') {
      if (!focus.length) return
      ui = setAndCopy(ui, focus, { expand: true })
      let children = walkTree(data, [...focus, childProp])
      if (children && Object.keys(children).length) {
        focus = [...focus, childProp, Object.keys(children)[0]]
      }
    }

    if (dir === 'out') {
      if (focus.length < 2) return
      ui = setAndCopy(ui, focus.slice(0, -2), { expand: false })
      if (focus.length > 2) {
        focus = focus.slice(0, -2)
      }
    }

    // console.log('setFocus', focus)
    this.setFocus(focus, ui)
  }

  setFocus (focus, ui) {
    ui = ui || this.state.ui

    if (shallowEqual(focus, this.state.focus)) return
    if (focus <= this.state.zoom) return

    if (this.state.focus.length) {
      ui = setAndCopy(ui, this.state.focus, { focus: false })
    }

    ui = setAndCopy(ui, focus, { focus: true })
    this.setState({ focus, ui })
  }

  onAction (path, op, opts) {
    const self = this
    opts = opts || {}

    return async (e) => {
      const { ui, data } = self.state
      const { childProp } = self.props

      const node = walkTree(data, path)
      if (!node) return

      let nodeState = walkTree(ui, path) || {}
      let state = {}

      if (op === 'expand') {
        let expand = opts.force ? true : !nodeState.expand
        state.ui = setAndCopy(ui, path, { expand })
        self.setState(state, fetch)
      }

      if (op === 'zoom') {
        let children = Object.keys(node[childProp] || {})
        if (!children.length) return
        state.ui = setAndCopy(ui, path, { zoom: true, expand: true })
        state.zoom = path
        self.setState(state, () => {
          self.setFocus([...path, childProp, children[0]])
        })
      }

      if (op === 'select') {
        state.select = path
        self.setState(state)
      }

      if (op === 'fetch') {
        fetch(true)
      }

      async function fetch (force) {
        if (force || !nodeState.fetch) {
          state.data = await self.fetchChildren(path, node, self.state.data)
          state.ui = setAndCopy(self.state.ui, path, node => ({ ...node, fetch: true }))
          self.setState(state)
        }
      }
    }
  }

  async fetchChildren (path, node, tree) {
    const { fetchChildren, childProp } = this.props
    let fetch = node.fetchChildren || fetchChildren
    if (!fetch) return tree
    let nodes = await fetch(node, path)
    if (nodes && Object.keys(nodes).length) {
      tree = setAndCopy(tree, path, { [childProp]: nodes })
    }
    return tree
  }

  render () {
    let { title, childProp, children } = this.props
    let { data, ui, zoom, select } = this.state

    let selected
    if (select.length) {
      selected = walkTree(data, select)
    } else select = null

    let path
    if (zoom.length) {
      let zoomData = walkTree(data, zoom)
      let zoomUi = walkTree(ui, zoom)

      path = zoom
      title = zoomData.title
      data = zoomData[childProp]
      ui = zoomUi[childProp]
    } else zoom = null

    return (
      <div>
        { zoom && <Button onClick={e => this.setState({ zoom: [] })}>BACK</Button>}
        <h3>{title}</h3>
        { select && <div>Selected: <em>{selected.title}</em></div> }
        <Tree
          onAction={this.onAction}
          childProp={childProp}
          nodes={data}
          state={ui}
          path={path}
          children={children}
        />
      </div>
    )
  }
}

export default TreeContainer

export function walkTree (tree, path) {
  if (!path || !path.length) return tree
  let res = path.reduce((cur, key) => {
    if (!cur || !cur[key]) return null
    return cur[key]
  }, tree)
  return res
}

export function setAndCopy (tree, path, props) {
  let cb
  if (typeof props !== 'function') cb = old => ({ ...old, ...props })
  else cb = props

  let newTree = { ...tree }

  if (!path.length) return cb(newTree)

  let oldPos = tree
  let newPos = newTree
  path.forEach((key, idx) => {
    let old = oldPos[key] || {}

    if (idx === path.length - 1) newPos[key] = cb(old)
    else newPos[key] = { ...old }

    oldPos = oldPos[key] || {}
    newPos = newPos[key]
  })

  return newTree
}

import React, { useEffect } from 'react'
import scrollIntoView from 'scroll-into-view-if-needed'
import { MdZoomIn, MdCloudDownload, MdSelectAll, MdExpandMore, MdExpandLess, MdCenterFocusStrong } from 'react-icons/md'

// import Tree from './index.js'
import { Tree, TreeNode, useTree } from './Tree.js'
// import Tooltip from '../Tooltip'
//
export function StandardTree (props) {
  return <Tree {...props} wrap={(tree, children) => <StandardTreeInner {...props} tree={tree} children={children} />} />
}

StandardTree.Node = StandardTreeNode

export default StandardTree

export function StandardTreeNode (props) {
  const { mode } = props
  const { grid } = props.treeProps
  if (mode === 'label') return <LabelNode {...props} />
  else if (grid) return <GridTreeNode {...props} />
  else return <LineTreeNode {...props} />
}

function LabelNode (props) {
  const { Icon, label } = props
  return <>{label}</>
  // return <><Icon /> {label}</>
}

export function LineTreeNode (props) {
  const { level, action, state, children, label, Icon, color, expandable, Node, renderChildren, treeProps } = props
  const { hideRoot } = treeProps

  let cls = itemClass({ color, ...state })

  if (level === 0 && hideRoot) {
    return renderChildren(props)
  }

  let renderedChildren = null
  if (state.expand) {
    renderedChildren = renderChildren(props)
  }


  let expand = (
    <div className='inline-block w-8 mr-1'>
      {expandable && state.expand && <MdExpandLess />}
      {expandable && !state.expand && <MdExpandMore />}
    </div>
  )

  return (
    <div>
      <ScrollIntoView doScroll={state.focus} />
      <div className={cls} onClick={onClick}>
        {expand}<Icon /> {label}
      </div>
      {/* <DebugActions action={props.action} state={props.state} /> */}
      { renderedChildren }
    </div>
  )

  function onClick () {
    if (expandable) {
      action('expand')()
      action('select')()
    }
    else action('select')()
  }
}

function GridTreeNode (props) {
  const tree = useTree()
  const { level, action, state, children, label, Icon, color, expandable, Node, renderChildren } = props
  let onClick = () => {
    if (expandable) {
      action('expand', true)()
      action('zoom')()
      action('select')()
    } else action('select')()
  }
  let cls = itemClass({ color, ...state })
  cls = 'w-32 h-24 rounded-sm border-grey-dark m-2 float-left hover:bg-grey-lightest rounded-lg flex flex-col ' + cls
  let zoomLevel = tree.state.zoom ? tree.state.zoom.length : 0
  // console.log('grid node', { level, zoomLevel, label })
  if (level === 0) return renderChildren(props)
  else {
    return (
      <div className={cls} onClick={onClick}>
        <div className='text-center'><Icon size={64} /></div>
        <div className='text-center'>{label}</div>
      </div>
    )
  }
}

class StandardTreeInner extends React.Component {
  constructor (props) {
    super(props)
    this.onKeydown = this.onKeydown.bind(this)
    console.log('INNER', props)
  }

  async onKeydown (e) {
    const { state, runAction } = this.props.tree
    const { keyboardFocus } = this.props
    if (!keyboardFocus) return
    if (e.altKey) return

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

    if (e.key === 'Enter') {
      if (!state.focus) return
      runAction('select', state.focus)
      // this.onAction(state.focus, 'select')(e)
    }

    if (e.key === 'z') {
      if (!state.focus) return
      runAction('zoom', state.focus)
    }
  }

  componentDidMount () {
    document.addEventListener('keydown', this.onKeydown, false)
  }

  componentWillUnmount () {
    document.removeEventListener('keydown', this.onKeydown, false)
  }

  changeFocus (dir) {
    const { state, runAction, getPath, setPath } = this.props.tree

    let { tree, focus } = state

    if (!Object.keys(tree).length) return

    focus = focus || []

    let id = focus.length ? focus[focus.length - 1] : null
    let node = getPath(focus)

    if (!focus.length) {
      return runAction('focus', [Object.keys(tree.children)[0]])
    }

    function getChildren (path) {
      let node = getPath(path)
      if (!node.expand || !node.children) return []
      // if (!node.children) return []
      let children = Object.keys(node.children)
      return children
    }

    let parent = focus.slice(0, -1)
    let siblings = getChildren(parent)
    let idx = siblings.indexOf(id)
    let children = getChildren(focus)
    // console.log('focus - cur %o, parent %o, siblings %o, idx %o, children %o', focus, parent, siblings, idx, children)

    if (dir === 'in') {
      if (children.length) {
        return runAction('focus', [...focus, children[0]])
      }
      runAction('expand', focus)
      runAction('focus', focus)
      return
    }

    if (dir === 'out') {
      if (node.expand) {
        runAction('expand', focus)
        return runAction('focus', focus)
      } else if (parent.length > 1) {
        return runAction('focus', parent.slice(0, -1))
      }
    }

    if (dir === 'up') {
      if (idx > 0) {
        let beforeChildren = getChildren([...parent, siblings[idx - 1]])
        if (beforeChildren.length) return runAction('focus', [...parent, siblings[idx - 1], beforeChildren[beforeChildren.length - 1]])
        return runAction('focus', [...parent, siblings[idx - 1]])
      }
      if (parent.length) return runAction('focus', parent)
      return
    }

    if (dir === 'down') {
      if (node.expand && children) {
        return runAction('focus', [...focus, children[0]])
      }
      if (idx < siblings.length - 1) {
        return runAction('focus', [...parent, siblings[idx + 1]])
      }
      let cur = focus
      while (cur.length) {
        let id = cur[cur.length - 1]
        cur = cur.slice(0, -1)
        let siblings = getChildren(cur)
        let idx = siblings.indexOf(id)
        if (idx < siblings.length - 1) {
          return runAction('focus', [...cur, siblings[idx + 1]])
        }
      }
    }
  }

  render () {
    const { grid, tree, Node } = this.props
    const { state, runAction } = tree
    return (
      <div>
        {grid && <Breadcrumb tree={tree} />}
        {this.props.children}
      </div>
    )
  }
}

function Breadcrumb (props) {
  const { tree } = props
  const { state, runAction, getPath, renderNode, treeProps } = tree
  let zoom = null
  if (!state.zoom || !state.zoom.length) return null
  return (
    <div className='flex'>
      {state.zoom.map((id, i) => <Item key={i} id={id} level={i} />)}
    </div>
  )

  function Item (props) {
    const { id, level } = props
    const path = state.zoom.slice(0, level + 1)
    const node = getPath(path)
    // console.log('bc n', node)
    // return null

    const Node = props => <TreeNode {...props} parent={path} level={level + 1} />
    let rendered = renderNode({ id, path, item: node.item, level, Node, mode: 'label', treeProps })
    let seperator = <div className='font-bold text-teal-darkest'>/</div>

    return (
      <>
        {seperator}
        <div className='px-2 cursor-pointer font-bold text-pink' onClick={onClick}>{rendered}</div>
      </>
    )

    function onClick () {
      let newZoom = path
      // if (level === 0) newZoom = []
      // else newZoom = path
      runAction('zoom', newZoom)
      runAction('select', newZoom)
    }
  }
}

// Todo: Convert to hook.
class ScrollIntoView extends React.Component {
  constructor (props) {
    super(props)
    this.el = React.createRef()
  }

  componentDidUpdate (prevProps) {
    if (!prevProps.doScroll && this.props.doScroll) {
      scrollIntoView(this.el.current, {
        behavior: 'smooth',
        scrollMode: 'if-needed',
        block: 'top',
        inline: 'top'
      })
    }
  }

  render () {
    return (
      <div ref={this.el} />
    )
  }
}


function itemClass ({ color, select, focus }) {
  let cls = ' cursor-pointer p-1 '
  cls += color ? 'text-' + color + ' ' : ''
  if (select) {
    cls += ' bg-blue-lighter '
  } else if (focus) {
    cls += ' bg-grey-lighter '
  } else {
    cls += ' bg-white '
  }
  return cls
}

// const Button = ({ children, onClick, on }) => {
//   let cls = 'rounded-full text-lg mr-1 cursor-pointer hover:bg-grey-light '
//   if (on) cls += 'text-green-dark'
//   return (
//     <div onClick={onClick} className={cls}>
//       {children}
//     </div>
//   )
// }

// const DebugActions = ({ action, state }) => {
//   return (
//     <div>
//       <div className='flex'>
//         <Button onClick={action('expand')} on={state.expand}>
//           <Tooltip content={state.expand ? 'Collapse' : 'Expand'}>
//             {state.expand && <MdExpandLess />}
//             {!state.expand && <MdExpandMore />}
//           </Tooltip>
//         </Button>
//         <Button onClick={action('focus')} on={state.focus}>
//           <Tooltip content='Focus'>
//             <MdCenterFocusStrong />
//           </Tooltip>
//         </Button>
//         <Button onClick={action('select')} on={state.select}>
//           <Tooltip content='Select'>
//             <MdSelectAll />
//           </Tooltip>
//         </Button>
//         <Button onClick={action('zoom')} on={state.zoom}>
//           <Tooltip content='Zoom'>
//             <MdZoomIn />
//           </Tooltip>
//         </Button>
//         <Button onClick={action('fetch')} on={state.fetch}>
//           <Tooltip content='Fetch children'>
//             <MdCloudDownload />
//           </Tooltip>
//         </Button>
//       </div>
//     </div>
//   )
// }

import React from 'react'
import scrollIntoView from 'scroll-into-view-if-needed'
import { MdZoomIn, MdCloudDownload, MdSelectAll, MdExpandMore, MdExpandLess, MdCenterFocusStrong } from 'react-icons/md'

// import Tree from './index.js'
import { Tree, TreeNode } from './Tree.js'
// import Tooltip from '../Tooltip'

export class StandardTreeNode extends React.Component {
  render () {
    const { children, label, icon, color, expandable, ...props } = this.props
    return (
      <Tree.Node {...props} expandable={expandable}>
        {(props) => {
          let { action, state, id } = props
          let expand = (
            <div className='inline-block w-8 mr-1'>
              {expandable && state.expand && <MdExpandLess />}
              {expandable && !state.expand && <MdExpandMore />}
            </div>
          )
          let onClick = () => {
            expandable ? action('expand')() : action('select')()
          }

          let cls = 'font-bold cursor-pointer p-1 '
          cls += color ? 'text-' + color + ' ' : ''
          if (state.select) {
            cls += ' bg-blue-lighter '
          } else if (state.focus) {
            cls += ' bg-grey-lighter '
          } else {
            cls += ' bg-white '
          }

          return (
            <div>
              <ScrollIntoView doScroll={state.focus} />
              <div className={cls} onClick={onClick}>
                {expand}{icon()} {label}
              </div>
              {/* <DebugActions action={props.action} state={props.state} /> */}
              { state.expand && children(props)}
            </div>
          )
        }}
      </Tree.Node>
    )
  }
}

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

export const StandardTree = (props) => {
  return (
    <Tree {...props}>
      {(treeProps) => <StandardTreeInner {...props} {...treeProps} />}
    </Tree>
  )
}

class StandardTreeInner extends React.Component {
  constructor (props) {
    super(props)
    this.onKeydown = this.onKeydown.bind(this)
  }

  async onKeydown (e) {
    const { state, keyboardFocus } = this.props
    if (!keyboardFocus) return
    let action = this.runAction.bind(this)

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
      action('select', state.focus)
      // this.onAction(state.focus, 'select')(e)
    }

    if (e.key === 'z') {
      if (!state.focus) return
      action('zoom', state.focus)
    }
  }

  componentDidMount () {
    document.addEventListener('keydown', this.onKeydown, false)
  }

  componentWillUnmount () {
    document.removeEventListener('keydown', this.onKeydown, false)
  }

  changeFocus (dir) {
    const { state, runAction, getPath, setPath } = this.props

    let { tree, focus } = state

    if (!Object.keys(tree).length) return

    focus = focus || []

    let id = focus.length ? focus[focus.length - 1] : null
    let node = getPath(focus)

    if (!focus.length) {
      return runAction('focus', ['children', Object.keys(tree.children)[0]])
    }

    function getChildren (path) {
      let node = getPath(path)
      if (!node.expand || !node.children) return
      let children = Object.keys(node.children)
      if (!children.length) return
      return children
    }

    let parent = focus.slice(0, -1)
    let siblings = Object.keys(getPath(parent))
    let idx = siblings.indexOf(id)
    let children = getChildren(focus)

    if (dir === 'in') {
      if (children) {
        return runAction('focus', [...focus, 'children', children[0]])
      }
      runAction('expand', focus)
      runAction('focus', focus)
      return
    }

    if (dir === 'out') {
      if (node.expand) {
        runAction('expand', focus)
        return runAction('focus', focus)
      } else if (parent.length > 2) {
        return runAction('focus', parent.slice(0, -1))
      }
    }

    if (dir === 'up') {
      if (idx > 0) {
        let beforeChildren = getChildren([...parent, siblings[idx - 1]])
        if (beforeChildren) return runAction('focus', [...parent, siblings[idx - 1], 'children', beforeChildren[beforeChildren.length - 1]])
        return runAction('focus', [...parent, siblings[idx - 1]])
      }
      if (parent.length > 2) return runAction('focus', parent.slice(0, -1))
      return
    }

    if (dir === 'down') {
      if (node.expand && children) {
        return runAction('focus', [...focus, 'children', children[0]])
      }
      if (idx < siblings.length - 1) {
        return runAction('focus', [...parent, siblings[idx + 1]])
      }
      let cur = focus
      while (cur.length) {
        let id = cur[cur.length - 1]
        cur = cur.slice(0, -2)
        let siblings = Object.keys(getPath([...cur, 'children']))
        let idx = siblings.indexOf(id)
        if (idx < siblings.length - 1) {
          return runAction('focus', [...cur, 'children', siblings[idx + 1]])
        }
      }
    }
  }

  runAction (name, path, props) {
    this.props.runAction(name, path, props)
  }

  render () {
    const { children } = this.props
    return children
  }
}

StandardTree.Node = StandardTreeNode

export default StandardTree

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

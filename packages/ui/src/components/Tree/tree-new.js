import React, { useState, useEffect, useRef } from 'react'
import shallowEqual from 'shallowequal'

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

// path may either be a string or an array.
// strings are splitted by /, arrays are flattened.
function resolvePath (path, prefix) {
  prefix = prefix || []
  let build = []
  map(path)
  return [...prefix, ...build]
  function map (el) {
    if (typeof el === 'string' && el.indexOf('/') > -1) el = el.split('/').filter(e => e)
    if (Array.isArray(el)) el.map(map)
    else build.push(el)
  }
}

// the tree state is stored in both a useRef and a useState
// this is so that the methods can operate on the mutable useRef,
// thus having always the correct value available.
export function useTree (props) {
  props = props || {}
  const ref = useRef({ tree: { children: {} }})
  const state = ref.current
  
  const [_tree, _setTree] = useState(state.tree)
  function setTree (fn) {
    _setTree(oldTree => {
      let newTree = fn(oldTree)
      state.tree = newTree
      return newTree
    })
  }
  state.setTree = setTree

  function setNodes (nodes, prefix) {
    setTree(tree => {
      Object.entries(nodes).forEach(([path, node]) => {
        tree = setAndCopy(tree, resolvePath(path, prefix), node)
      })
      return tree
    })
  }
  state.setNodes = setNodes

  function setNode (path, node) {
    path = resolvePath(path)
    setTree(tree => setAndCopy(tree, path, node))
  }
  state.setNode = setNode


  function getState (path) {
    if (!path) return state.tree[S] || {}
    path = resolvePath(path)
    let value = getPathState(state.tree, path)
    // let value = walk(ui.tree, path)
    // if (value === undefined) value = {}
    return value
  }
  state.getState = getState

  function setState (path, value) {
    path = resolvePath(path)
    setTree(tree =>setPathState(tree, path, value))
  }
  state.setState = setState

  function getNode (path) {
    path = resolvePath(path)
    return walk(state.tree, path)
  }
  state.getNode = getNode

  function getRoots () {
    return state.tree.children
  }
  state.getRoots = getRoots

  const ACTIONS = {
    expand (tree, path, value) {
      return setPathState(tree, path, state => {
        let expand
        if (value !== undefined) expand = value
        else expand = !state.expand
        return { ...state, expand }
      })
    },
    focus (tree, path, value) {
      return toggleValue(tree, path, 'focus')
    },
    select (tree, path, value) {
      if (!path) path = getNodeState(tree).focus
      if (!path || !path.length) return
      if (props.onSelect) props.onSelect(path)
      return toggleValue(tree, path, 'select')
    },
    zoom (tree, path) {
      let zoom = getNodeState(tree).zoom
      if (zoom === path || path === null || !path.length) {
        tree = setNodeState(tree, { zoom: null })
        tree = setPathState(tree, zoom, { zoom: null })
      } else {
        return toggle(tree, path, 'zoom')
      }
    }
  }

  function action (name, path, prop) {
    path = resolvePath(path)
    console.log('action', name, path, prop)
    setTree(tree => ACTIONS[name](tree, path, prop))
  }
  state.action = action


  return state
}

export function useKeyboardTree (props) {
  const tree = useTree(props)
  const state = tree.getState()

  useEffect(() => {
    document.addEventListener('keydown', onKeydown, false)
    return () => document.removeEventListener('keydown', onKeydown, false)
  }, [])

  return tree

  function runAction (action, path, props) {
    console.log('runAction', action, path, props)
    tree.action(action, path, props)
  }

  function onKeydown (e) {
    // const { state, runAction } = this.props.tree
    // const { keyboardFocus } = this.props
    // if (!keyboardFocus) return

    if (e.key === 'ArrowDown') {
      changeFocus('down')
      e.preventDefault()
    }
    if (e.key === 'ArrowUp') {
      changeFocus('up')
      e.preventDefault()
    }
    if (e.key === 'ArrowRight') {
      changeFocus('in')
      e.preventDefault()
    }

    if (e.key === 'ArrowLeft') {
      changeFocus('out')
      e.preventDefault()
    }

    if (e.key === 'Enter') {
      if (!state.focus) return
      // runAction('select')
      this.onAction(state.focus, 'select')(e)
    }

    if (e.key === 'z') {
      if (!state.focus) return
      runAction('zoom', state.focus)
    }
  }

  function changeFocus (dir) {
    // const { state, runAction, getPath, setPath } = this.props.tree

    // console.log('changeFocus', tree, tree.tree, tree.getState(), tree.getRoots())
    const state = tree.getState()
    const roots = tree.getRoots()
    let { focus } = state

    // console.log('changeFocus', dir, state, tree, roots, tree.tree)
    if (!Object.keys(roots).length) return

    focus = focus || []

    let id = focus.length ? focus[focus.length - 1] : null

    let node = tree.getNode(focus)
    let nodeState = tree.getState(focus)

    if (!focus.length) {
      let first = Object.keys(roots)[0]
      let newFocus = [first, Object.keys(roots[first].children)[0]]
      return runAction('focus', newFocus) 
    }

    function getChildren (path) {
      let node = tree.getNode(path)
      // todo: don't if not expanded?
      if (!node.children) return []
      // if (!node.children) return []
      let children = Object.keys(node.children)
      return children
    }

    let parent = focus.slice(0, -1)
    let siblings = getChildren(parent)
    let idx = siblings.indexOf(id)
    let children = getChildren(focus)
    // console.log('focus - id %o cur %o, parent %o, siblings %o, idx %o, children %o', id, focus, parent, siblings, idx, children)
    console.log('move', dir, focus, { node, parent, siblings, idx, children })

    if (dir === 'in') {
      if (children.length && nodeState.expand) {
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
      console.log('DOWN', { focus, node, siblings, parent, idx })
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

}

export const S = Symbol('state')

function setNodeState (node, newState) {
  let state = node[S] || {}
  if (typeof newState === 'function') {
    state = newState(state)
  } else {
    state = Object.assign({}, state, newState)
  }
  return Object.assign({}, node, { [S]: state })
}

export function getNodeState (node) {
  if (!node || !node[S]) return {}
  return node[S]
}

function setPathState (tree, path, state) {
  return setAndCopy(tree, path, node => setNodeState(node, state))
}

function getPathState (tree, path) {
  let node = walk(tree, path)
  return getNodeState(node)
}

function toggleValue (tree, path, prop) {
  let state = getNodeState(tree)
  console.log('toggle', prop, state, path)
  if (state[prop]) {
    tree = setPathState(tree, state[prop], { [prop]: false })
  }
  tree = setPathState(tree, path, { [prop]: true })
  tree = setNodeState(tree, { [prop]: path })
  return tree
}


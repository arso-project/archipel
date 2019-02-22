import React, { useState, useEffect, useRef, useMemo, useContext } from 'react'
import { useToggle, useKey } from '../../lib/hooks'

const KeyboardCtx = React.createContext()

export function useKeyboardNav (props) {
  const context = useContext(KeyboardCtx)
  const [next, setNext] = useState()
  /* const wantExpand = useRef(false) */
  const [wantExpand, setWantExpand] = useState(false)
  let { focusRole } = props
  let role = Object.assign({}, { lvl: 0, idx: 0, parentIdx: 0 }, focusRole)

  const { focus, intent, setIntent, setFocus } = context

  function hasFocus () {
    return focus.lvl === role.lvl && focus.idx === role.idx && focus.parentIdx === role.parentIdx
  }

  useEffect(() => {
    if (!intent) return
    /* console.log('eff', focus, role, hasFocus(), intent) */
    /* console.log('eff2', focus.lvl === (role.lvl + 1) && focus.parentIdx === role.idx) */
    if (intent === 'down') {
      if (focus.lvl === (role.lvl + 1) && focus.parentIdx === role.idx) {
        setIntent(null)
        setNext({ idx: focus.idx + 1})
      }
    } else if (intent === 'up') {
      if (focus.lvl === (role.lvl + 1) && focus.parentIdx == role.idx) {
        setIntent(null)
        setNext({ idx: focus.idx - 1 })
      }
    } else if (hasFocus() && intent === 'in') {
      console.log('GO IN!')
      setWantExpand(val => {
        setNext({ idx: 0 })
        setIntent(null)
        return true
      })
      /* wantExpand.current = true */
      /* setExpand(true) */
    }
  }, [hasFocus(), intent, next])

  function handleNext (props) {
    setNext(null)
    setFocus({ parentIdx: role.idx, ...props })
  }

  function child (i, len) {
    /* console.log('has next') */
    console.log('make child', props.path, i, next)
    if (next && next.idx > -1) {
      if (next.idx > len && i === 0) handleNext({ idx: i })
      if (next.idx === i) handleNext({ idx: i })
    }
    let newRole = {
      lvl: role.lvl + 1,
      idx: i,
      parentIdx: role.idx
    }
    return { role: newRole }
  }

  return {
    hasFocus,
    child,
    wantExpand
  }
}

export function KeyboardNav (props) {
  let { children } = props
  const [focus, _setFocus] = useState({ lvl: 1, idx: 0, parentIdx: 0 })
  const [intent, setIntent] = useState(null)

  useKey('ArrowDown', down)
  useKey('ArrowUp', up)
  useKey('ArrowLeft', outof)
  useKey('ArrowRight', into)

  function setFocus (props) {
    if (typeof props === 'function') _setFocus(props)
    else {
      _setFocus(focus => {
        console.log('new f', { ...focus, ...props })
        return { ...focus, ...props }
      })
    }
    setIntent(null)
  }

  const context = useMemo(() => {
    const context = {
      down, up, focus, intent, setIntent, setFocus
    }
    return context
  }, [intent, focus])

  function down () {
    setIntent('down')
  }

  function up () {
    setIntent('up')
  }

  function into () {
    setIntent('in')
  }

  function outof () {
    // setIntent('out')
    setFocus(focus => {
      if (focus.lvl === 0) return focus
      else return { ...focus, lvl: focus.lvl - 1, idx: focus.parentIdx }
    })
  }

  console.log('ctx', context.focus, context.intent)

  return (
    <KeyboardCtx.Provider value={context}>
      {children}
    </KeyboardCtx.Provider>
  )
}

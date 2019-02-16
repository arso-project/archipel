import React, { useState, useEffect } from 'react'

const defaultState = { data: undefined, pending: false, error: false, started: false }

export function useAsyncState () {
	const [state, setState] = useState(defaultState)
	return {
		state,
    setError: error => { setState(state => ({ ...defaultState, pending: false, started: true, error }))},
    setStarted: started => { setState(state => ({ ...defaultState, pending: true, started }))},
    setPending: () => { setState(state => ({ ...state, pending: true }))},
    setSuccess: data => { setState(state => ({ ...defaultState, pending: false, started: true, data }))}
	}
}

export function useAsync (defaultValue) {
	const { state, setError, setPending, setSuccess, setStarted } = useAsyncState()
	return [state, setPromise]

	function setPromise (asyncFn) {
    let abort = false
		if (!state.started) setStarted(true)
		else setPending()

    const maybeAbort = fn => (...args) => {
      if (!abort) fn(...args)
    }

    // asyncFn({ setError, setPending, setSuccess })
    asyncFn()
      .then(maybeAbort(setSuccess))
      .catch(maybeAbort(setError))

    return () => { abort = true }
	}
}

export function useAsyncEffect (asyncFn, inputs) {
	const [state, setPromise] = useAsync()
  useEffect(() => {
    let abort = setPromise(asyncFn)
    return abort
  }, inputs)
	return state
}

export function useCounter () {
  const [state, setState] = useState(1)
  return [
    state,
    () => setState(state + 1)
  ]
}

export function useForm (defaultValue) {
  defaultValue = defaultValue || {}
  const [state, setState] = useState(defaultValue)
  return [
    state,
    itemProps,
    makeItem
  ]

  function itemProps (name, defaultValue) {
    let value = state[name] === undefined ? defaultValue : state[name]
    let onChange = e => setState({ ...state, [name]: e.target.value })
    return { name, value, onChange }
  }

  function makeItem ({ title, name, defaultValue, type }) {
    defaultValue = defaultValue || ''
    return (
      <>
        {title && <label htmlFor={name}>{title}</label> }
        <input type={type} {...itemProps(name, defaultValue)} />
      </>
    )
  }
}

export function useToggle (init) {
  const [state, setState] = useState(init ? true : false)
  return [state, () => setState(state => !state)]
}

export function useRerender () {
  const [_, setState] = useState(true)
  const rerender = () => setState(state => !state)
  return rerender 
}

export function useKey (key, cb) {
  useEffect(() => {
		function onKeydown (e) {
			if (e.key === key) cb(e)
		}
		document.addEventListener('keydown', onKeydown)
		return () => document.removeEventListener('keydown', onKeydown)
	}, [])
}

export function useStack () {
  const [state, setState] = useState()
  return [
    state,
    val => setState([...state, val]),
    () => setState([])
  ]
}

export function copyToClipboard (str) {
  const el = document.createElement('textarea');
  el.value = str;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}


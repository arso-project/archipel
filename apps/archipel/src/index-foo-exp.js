import React, { useEffect, useContext, useState, useMemo } from 'react'
import { render } from 'react-dom'

// import { App } from '@archipel/app'
// import extensions from '../extensions'


const Context = React.createContext()

function App (props) {
  const [state, setState] = useState({ i: 0, input: { value: '' } })
  const value = useMemo(() => {
    return [state, setState]
  }, [state])

  useEffect(() => {
    let interval = setInterval(() => setState(state => ({ ...state, i: state.i + 1 })), 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <Context.Provider value={value}>
      <Widget />
      <Other />
    </Context.Provider>
  )
}

function Widget (props) {
  const [state, setState] = useContext(Context)
  return (
    <div>
      <h1>value: {state.i}</h1>
      <input onChange={e => onChange(e.target.value)} type='text' />
    </div>
  )

  function onChange (value) {
    setState(state => ({ ...state, input: { value } }))
  }
}

function Other (props) {
  const [state, setState] = useContext(Context)
  const inner = useMemo(() => <Inner input={state.input} />, [state.input])
  let change = state.i % 5 === 0
  const cachedCounter = useMemo(() => <h4>{state.i}</h4>, [change])
  return (
    <div>outer
      <div style={{ padding: '50px' }}>
        {inner}
        {cachedCounter}
      </div>
    </div>
  )
}

function Inner (props) {
  const { input } = props
  return <h4>inner: {input.value}</h4>
}

  render(
    <App />,
    document.querySelector('div')
  )

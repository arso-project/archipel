'use strict'

import { fooTest, streamingTest } from './../api'
import rpc from './../api/rpc'

export const setTitle = title => ({ type: 'SET_TITLE', title })
export const increment = () => ({ type: 'INCREMENT' })

export const streamingAction = (str) => (dispatch) => {
  streamingTest(str, (err, rs) => {
    if (err) return
    rs.on('data', (data) => dispatch({ type: 'SET_TITLE', title: data }))
    rs.on('end', () => dispatch({ type: 'SET_TITLE', title: 'finished!' }))
  })
}

export const fooAction = (str) => (dispatch) => {
  rpc((api) => api.foo(str, (err, data) => {
    if (!err) {
      console.log('got api response')
      dispatch({ type: 'SET_TITLE', title: data })
    }
  }))
}

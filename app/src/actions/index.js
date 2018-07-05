'use strict'
import { createRs, fillRs } from '../util.js'
import rpc from './../api/rpc'
import rpc2 from './../api/rpc2'

// Simple actions.

export const setTitle = title => ({ type: 'SET_TITLE', title })
export const uiTree = (path, props) => ({ type: 'SET_UI_TREE', path, props })

// Thunky actions.

var run = 0
export const streamingAction = (str) => (dispatch, getState) => {
  run++
  var t0 = performance.now()
  var buffer = []
  var rs = createRs()
  rpc((api) => api.streaming('yeah', fillRs(rs)))
  console.log('go sr1')
  var i = 0
  rs.on('data', (data) => {
    i++
    if (i % 1000 === 0) { console.log(i) }
    buffer.push(data)
  })
  rs.on('end', () => {
    var t1 = performance.now()
    dispatch({ type: 'SET_TITLE', title: 'rpc1 finished! with ' + buffer.length })
    console.log('done sr1 ' + run, (t1 - t0) / 1000)
  })
}

var run2 = 0
export const streamingAction2 = (str) => (dispatch, getState) => {
  run2++
  var t0 = performance.now()
  var buffer = []
  var rs = createRs()
  rpc2((api) => api.streaming('yeah', fillRs(rs)))
  console.log('go sr2')
  rs.on('data', (data) => buffer.push(data))
  rs.on('end', () => {
    var t1 = performance.now()
    dispatch({ type: 'SET_TITLE', title: 'rpc2 finished! with ' + buffer.length })
    console.log('done sr2 ' + run2, (t1 - t0) / 1000)
  })
}

export const fooAction = (str) => (dispatch) => {
  rpc((api) => api.foo(str, (err, data) => {
    if (!err) dispatch(setTitle(data))
  }))
}

export const queryAction = (key, query) => (dispatch) => {
  const triples = []
  const rs = createRs()
  rpc((api) => api.query(key, query, fillRs(rs)))
  rs.on('data', (triple) => triples.push(triple))
  rs.on('end', () => dispatch({ type: 'TRIPLES_LOAD', triples: triples }))
}

// function Thing (id) {
//   if (!(this instanceof Thing)) return new Thing(id)
//   this.id = id
// }

// Thing.prototype.add = function (triple) {
//   if (Array.isArray(triple)) return triple.map((t) => this.addProps(t))
//   if (triple.subject !== this.id) return
//   this[triple.predicate] = this[triple.predicate] || []
//   this[triple.predicate].push(triple.object)
// }

// function add (thing, triple) {
//   if (Array.isArray(triple)) return triple.map((t) => add(thing, t))
//   const { subject, predicate, object } = triple
//   if (subject !== thing.id) return
//   if (predicate === 'rdf:type') thing.type = fromRdfValue(object)
//   else {
//     thing[predicate] = [...(thing[predicate] || []), object]
//   }
// }
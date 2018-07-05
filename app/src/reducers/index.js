'use strict'

import { fromRdfValue } from '../util'

const defaultState = {
  title: 'Archipel: Somoco',
  things: {
    all: {},
    byType: {}
  },
  ui: {
    tree: []
  }
}

const ArchipelReducer = (state = defaultState, action) => {
  switch (action.type) {
    case 'SET_TITLE':
      return {
        ...state,
        title: action.title
      }
    case 'TRIPLES_LOAD':
      const newOrChangedThings = triplesToThings(state.things.all, action.triples)
      if (!newOrChangedThings) return state
      const byType = thingsByType(state.things.byType, newOrChangedThings)
      return {
        ...state,
        things: {
          ...state.things,
          all: { ...state.things.all, ...newOrChangedThings },
          byType: { ...state.things.byType, ...byType }
        }
      }
    case 'SET_UI_TREE':
      const newTree = mapPathPropOnTree(state.ui.tree, action.path, action.props)
      return {
        ...state,
        ui: { ...state.ui, tree: { ...state.ui.tree, ...newTree } }
      }
    default:
      return state
  }
}

function mapPathPropOnTree (old, path, props) {
  const newTree = {}
  let oldPos = old
  let pos = newTree
  path.forEach((id, idx) => {
    oldPos = oldPos[id] || {}
    pos[id] = { ...oldPos }
    if (idx === path.length - 1) {
      pos[id] = { ...pos[id], ...props }
    }
    pos = pos[id]
  })
  return newTree
}

// Only assigns actual changes. Unchanged refs are kept.
function triplesToThings (old, triples) {
  const things = {}
  let nochange = 0

  triples.forEach((triple) => {
    const { subject, predicate, object } = triple

    if (old[subject] && old[subject][predicate] && old[subject][predicate].indexOf(object) !== -1) {
      things[subject] = old[subject]
      nochange++
      return
    }

    if (!things[subject]) {
      if (old[subject]) things[subject] = { ...old[subject] }
      else things[subject] = { id: subject }
    }

    if (predicate === 'rdf:type') things[subject].type = fromRdfValue(object)
    else things[subject][predicate] = [...things[subject][predicate] || [], object]
  })

  if (nochange === triples.length) return false
  return things
}

function thingsByType (old, things) {
  return Object.keys(things).reduce((byType, key) => {
    if (!things[key].type) return byType
    const type = things[key].type
    if (!byType[type]) byType[type] = [...old[type] || []]
    byType[type] = [...byType[type], things[key].id]
    return byType
  }, {})
}

export default ArchipelReducer

import { useState, useEffect } from 'react'
import { getApi } from '../../lib/api'
import { useAsyncEffect } from '../../lib/hooks'
import produce from 'immer'
import nanoid from 'nanoid'

let entities = {}
let subscribers = new Set()

export function makeId () {
  return nanoid()
}

export function addTriples (triples) {
  // let subjects = toSubjects(triples
  entities = produce(state => triplesToThings(state, triples))
}

export function useEntity (id) {
  const [state, setState] = useState(() => entities[id])
  useEffect(() => {
    subscribers.add(set)
    return () => subscribers.delete(set)
    function set (next) {
      setState(state => {
        return next[id]
      })
    }
  }, [])
  return state || []
}

export function toObjects (triples) {
  return triples.reduce((acc, t) => {
    acc[t.object] = acc[t.object] || {}
    acc[t.object][t.predicate] = acc[t.object][t.predicate] || []
    acc[t.object][t.predicate].push(t.subject)
    return acc
  }, {})
}

export function toSubjects (triples) {
  if (!triples || !triples.length) return {}
  return triples.reduce((acc, t) => {
    acc[t.subject] = acc[t.subject] || {}
    acc[t.subject][t.predicate] = acc[t.subject][t.predicate] || []
    acc[t.subject][t.predicate].push(t.object)
    return acc
  }, {})
}

export function triplesToThings (state, triples) {
  if (!triples || !triples.length) return state
  triples.forEach((triple) => {
    let { subject, predicate, object } = triple
    // object = fromRdfValue(object)

    if (state[subject] && state[subject][predicate] && state[subject][predicate].indexOf(object) !== -1) {
      return
    }

    if (!state[subject]) {
      state[subject] = { _id: subject }
    }

    if (state[subject][predicate]) {
      state[subject][predicate].push(object)
    } else {
      state[subject][predicate] = [ object ]
    }
  })
  return state
}

export function useQuery (archiveKey, query) {
  let res = useAsyncEffect(async () => {
    let api = await getApi()
    let triples = await api.hypergraph.get(archiveKey, query)
    let objects = toSubjects(triples)
    return objects
  }, [archiveKey])
  return res
}

export function spo (s, p, o) {
  return { subject: s, predicate: p, object: o }
}

export function makeEntity (type, props) {
  props = props || {}
  let id
  if (!props.id) id = makeId()
  let entity = {
    type,
    id
  }
  Object.keys(props).forEach(prop => {
    entity[prop] = props[prop]
  })
  return entity
}

export function entityToTriples (entity) {
  if (!entity._id) throw new Error('Entity has no id.')
  let id = entity._id
  let triples
  Object.keys(entity).forEach(key => {
    if (key.charAt(0) === '_') return
    triples.push(spo(id, key, toRdfValue(entity[key])))
  })
  return triples
}

export function isLiteral (value) {
  return (typeof value === 'string' && value.charAt(0) === '"')
}

export function isThing (value) {
  return !isLiteral(value)
}

const rdfLiteralMatch = /(".+")(?:\^\^(.+))?$/

export function fromRdfValue (value) {
  const match = value.match(rdfLiteralMatch)
  if (!match) return { _id: value }
  // this could be smarter getting value type as well.
  // return { value: match[1], type: match[2] }
  if (match[2] === 'xsd:decimal') {
    return parseFloat(match[1].slice(1, -1))
  }
  return JSON.parse(match[1])
}

export function toLiteral (value) {
  if (typeof value === 'number') {
    return `"${value}"^^xsd:decimal`
  } else {
    return JSON.stringify(value)
  }
}

export function toRdfValue (value) {
  if (isNode(value)) {
    return value._id
  } else {
    return toLiteral(value)
  }
}

function isNode (value) {
  return typeof value === 'object' && value._id
}

import { useState, useEffect } from 'react'
import { getApi } from '../../lib/api'
import { useAsyncEffect } from '../../lib/hooks'
import produce from 'immer'

let entities = {}
let subscribers = new Set()

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
      state[subject] = { id: subject }
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
    let triples =  await api.hypergraph.get(archiveKey, query)
    let objects = toSubjects(triples)
    return objects
  }, [archiveKey])
  return res
}

export function spo (s, p, o) {
  return { subject: s, predicate: p, object: o }
}

import { useState, useEffect } from 'react'
import { getApi } from '../../lib/api'

let stats = {}
const subscribers = new Set()

function setStats (value) {
  stats = value
  triggerUpdate()
}

export function watchStats (fn, init) {
  subscribers.add(fn)
  if (init) fn(stats)
}

export function unwatchStats (fn) {
  subscribers.delete(fn)
}

function triggerUpdate () {
  subscribers.forEach(fn => fn(stats))
}

export function init () {
  getApi().then(api => go(api))

  async function go (api) {
    let networkStream = await api.hyperlib.createStatsStream(5000)
    networkStream.on('data', data => {
      setStats(data)
    })
  }
}

export function useStats () {
  const [state, setState] = useState(stats)
  useEffect(() => {
    watchStats(setState, init)
    return () => unwatchStats(setState)
  }, [])
  return state
}

export function useArchiveStats (archive) {
  const [state, setState] = useState(null)

  useEffect(() => {
    let structures = []
    archive.structures.map(s => structures.push(s.key))

    watchStats(update, init)
    return () => unwatchStats(update)

    function update (stats) {
      let filteredStats = {}
      for (let key of structures) {
        filteredStats[key] = stats[key]
      }
      setState(state => {
        if (!Object.values(filteredStats).filter(x => x).length) return null
        if (deepEqual(state, filteredStats)) return state
        return filteredStats
      })
    }
  }, [archive])
  return state
}

function deepEqual (a, b) {
  // if (a !== b) return false // unequal by reference

  // according to http://www.mattzeunert.com/2016/01/28/javascript-deep-equal.html
  // the following is faster than module deep-equal https://github.com/substack/node-deep-equal/
  // so subject to high quality optimization
  let sa = JSON.stringify(a)
  let sb = JSON.stringify(b)

  if (sa !== sb) return false

  return true
}

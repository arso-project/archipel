export const S = Symbol('state')
import { MapOfSets } from '@archipel/common/util/map'

// export const _stores = []

export class Store {
  constructor (name) {
    this.name = name
    this.res = {}
    this.subscribers = new MapOfSets()
    this.listSubscribers = new Set()
    // _stores.push(this)
  }

  watch (id, fn, init) {
    this.subscribers.add(id, fn)
    if (init) fn(this.get(id))
  }

  unwatch (id, fn) {
    this.subscribers.delete(id, fn)
  }

  watchList (fn) {
    this.listSubscribers.add(fn)
  }

  unwatchList (fn) {
    this.listSubscribers.delete(fn)
  }

  trigger (id) {
    if (!this.subscribers.has(id)) return
    let res = this.get(id)
    this.subscribers.get(id).forEach(fn => fn(res, id))
  }

  triggerList () {
    this.listSubscribers.forEach(fn => fn(this.all()))
  }

  ids () {
    return Object.keys(this.res) || []
  }

  get (id) {
    if (!this.res[id]) this.res[id] = {}
    return this.res[id]
  }

  all () {
    return Object.values(this.res)
  }

  set (id, obj) {
    let old = this.res[id]
    if (obj === old) return
    let next
    if (typeof obj === 'function') {
      next = obj(old, id)
      if (next === old) return
    } else {
      next = Object.assign({}, old, obj)
    }
    this.res[id] = next
    this.trigger(id)
    this.triggerList()
  }

  delete (id, skipTrigger) {
    delete this.res[id]
    delete this.subscribers[id]
  }
}

export class StatefulStore extends Store {
  constructor () {
    super()
    this.state = {}
  }

  setState (id, state, skipUpdate) {
    let old = this.state[id] || {}
    if (old === state) return
    let next
    if (typeof state === 'function') {
      next = state(old, id)
      if (old === next) return
    } else {
      next = Object.assign({}, old, state)
    }
    this.state[id] = next
    if (!skipUpdate) this.trigger(id)
  }

  getState (id) {
    return this.state[id] || {}
  }

  get (id) {
    let obj = super.get(id)
    if (!obj[S]) obj[S] = this.getState(id)
    return obj
  }
}

export function state (obj) {
  return obj[S] || {}
}

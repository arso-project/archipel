export const S = Symbol('state')

// export const _stores = []

export class Store {
  constructor (name) {
    this.name = name
    this.res = {}
    this.subscribers = {}
    // _stores.push(this)
  }

  watch (id, fn, init) {
    this.subscribers[id] = this.subscribers[id] || []
    this.subscribers[id].push(fn)
    if (init) fn(this.get(id))
  }

  unwatch (id, fn) {
    if (!this.subscribers[id]) return
    this.subscribers[id] = this.subscribers[id].filter(cb => cb !== fn)
  }

  trigger (id) {
    if (!this.subscribers[id]) return
    let res = this.get(id)
    this.subscribers[id].forEach(fn => fn(res, id))
  }

  ids () {
    return Object.keys(this.res)
  }

  get (id) {
    if (!this.res[id]) this.res[id] = {}
    return this.res[id]
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

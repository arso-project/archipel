import { useRef, useState, useEffect } from 'react'
import { getApi } from './api.js'
import { useToggle } from './hooks.js'
import produce from 'immer'

// const S = {}
// S.NotStarted = 0x000001
// S.Pending    = 0x000010
// S.Fetched    = 0x000100
// S.Children   = 0x001000
// S.Data       = 0x010000
// S.Error      = 0x100000

const defaultState = { data: undefined, pending: false, error: false, started: false }

class Store {
  constructor () {
    this.store = new Map()
  }

  add (obj) {
    let link = obj.toLink()
    this.store.set(link, obj)
  }

  get (link) {
    return this.store.get(link)
  }

  has (link) {
    return this.store.has(link)
  }
}

const STORE = new Store()


class Entity {
  constructor (link, data) {
    this.link = link

    this.pending = false
    this.hasStarted = false
    this.error = false

    this.data = data || undefined

    this._watchers = new Set()
    if (data) this.data = data
    if (!this.data && this.fetch) {
      this.fetch().then(() => this.inspect('fetched'))
    }
  }

  async init () {
    if (this._init) return
    this.api = await getApi()
    this._init = true
  }

  set (data) {
    this.data = data
  }

  get () {
    return this.data
  }

  watch (fn) {
    this._watchers.add(fn)
  }

  unwatch (fn) {
    this._watchers.delete(fn)
  }

  trigger () {
    this._watchers.forEach(el => el(this))
  }

  hasData () {
    // console.log('has?', this.data)
    if (this.data === undefined && !this._fetched) return false
    return true
  }

  load () {
    if (!this.pending && !this.data) this.fetch()
  }
}

class Stat extends Entity {
  static resolveLink (link) {
    if (typeof link === 'string') {
      let [key, ...path] = link.split('/')
      if (!path.length) path = '/'
      else path = path.join('/')
      link = { key, path }
    }
    return link
  }

  static makeLink (link) {
    return [link.key, link.path].join('/')
  }

  static fromLink (link, data) {
    return new Stat(Stat.resolveLink(link), data)
  }

  toLink () {
    return Stat.makeLink(this.link)
  }

  async fetch (force) {
    if ((this.data || this.error) && !force) return

    this.hasStarted = true
    this.pending = true

    await this.init()

    try {
      this.data = await this.api.hyperdrive.stat(this.link.key, this.link.path, 1)
    } catch (e) {
      this.error = e
      return
    }

    if (this.data.children) {
      this.data.children = this.data.children.map(stat => {
        let link = { key: this.link.key, path: stat.path }
        let childStat = getEntity('stat', link, stat)
        // childStat.set(stat)
        return childStat.toLink()
      })
    } else {
      this.data.children = []
    }
    this.pending = false
    this.trigger()
  }

  children () {
    if (!this.data.isDirectory) return []

    return this.data.children.map(link => getEntity('stat', link))

    // if (this.data.isDirectory && !this._fetched) this.fetch()
    // if (this.data === undefined || (this.data.isDirectory && this.data.children === undefined)) this.fetch()
    // if (!this.data.isDirectory) return []
    // if (!this.data.children) return []
    // return this.data.children.map(id => getEntity('stat', id))
  }

  inspect (msg) {
    let w = (f, c) => f ? c : '-'
    let s = w(this.hasStarted, 'S') + w(this.pending, 'P') + w(this.error, 'E') + w(this.data, 'D')
    let l = this.link.key + ' ' + this.link.path
    console.log(`%s %o %o %o %o`, msg, l, s, this.error, this.data)
  }
}

const TYPES = {
  stat: Stat
}

export function getType (type) {
  return TYPES[type]
}

export function setType (type, Class) {
  TYPES[type] = Class
}

export function getEntity (type, link, data) {
  // if (!link) [type, link] = type.split('/')

  const Class = getType(type)
  if (!Class) throw new Error('Invalid entity type: ' + type)

  let str = Class.makeLink(link)
  // console.log('GET', link, str)

  if (STORE.has(str)) return STORE.get(str)

  let entity = Class.fromLink(link, data)
  STORE.add(entity)

  return entity
}

export function useEntity (type, link) {
  const [_, rerender] = useToggle()
  const [entity, setEntity] = useState(() => getEntity(type, link))

  // if (!entity.current) entity.current = getEntity(type, link)

  useEffect(() => {
    const entity = getEntity(type, link)
    // if (!entity.current.hasData()) entity.current.fetch()
    // console.log('effect', link, entity.current, entity.current.get())
    // if (!entity.current.data) entity.current.load()
    // console.log('effect', entity)
    entity.inspect('effect')
    // if (!entity.data) entity.fetch()

    const render = () => rerender()
    entity.watch(render)
    return () => entity.current.unwatch(render)
  }, [])

  // return entity.current
  return entity
}

window.getEntity = getEntity


class MapOfSets {
  constructor () {
    this.map = new Map()
  }

  add (key, value) {
    if (value === undefined) return
    this.map.set(key, this.get(key).add(value))
  }

  delete (key, value) {
    if (value === undefined) this.map.delete(key)
    if (!this.map.has(key)) return
    this.map.set(key, this.map.get(key).delete(value))
  }

  get (key) {
    return this.map.has(key) ? this.map.get(key) : new Set()
  }

  has (key, value) {
    if (value === undefined) return this.map.has(key)
    if (!this.map.has(key)) return false
    return this.map.get(key).has(value)
  }
}

class MapOfMaps {
  constructor() {
    this.map = new Map()
  }

  has (key1, key2) {
    if (!this.map.has(key1)) return false
    return this.map.get(key1).has(key2)
  }

  get (key1, key2) {
    if (key2 === undefined) return this.map.get(key1)
    if (!this.map.has(key1)) return undefined
    return this.map.get(key1).get(key2)
  }

  set (key1, key2, value) {
    if (!this.map.has(key1)) this.map.set(key1, new Map())
    this.map.get(key1).set(key2, value)
  }

  delete (key1, key2) {
    if (key2 === undefined) return this.map.delete(key1)
    if (!this.map.has(key1)) return
    this.map.get(key1).delete(key2)
  }
}

class MapOfMapOfSets {
  constructor () {
    this.map = new MapOfMaps()
  }

  has (key1, key2, value) {
    if (!this.map.has(key1, key2)) return false
    if (value === undefined) return true
    return this.map.get(key1, key2).has(value)
  }

  add (key1, key2, value) {
    let set
    if (!this.map.has(key1, key2)) {
      set = new Set()
      this.map.set(key1, key2, set)
    } else {
      set = this.map.get(key1, key2)
    }
    set.add(value)
  }

  get (key1, key2) {
    return this.map.get(key1, key2)
  }

  delete (key1, key2, value) {
    if (key2 === undefined) return this.map.delete(key1)
    if (value === undefined) return this.map.delete(key1, key2)
    if (!this.map.has(key1, key2)) return
    this.map.get(key1, key2).delete(value)
  }
}

class IndexedMap {
  constructor (keys) {
    this.store = new Map()
    this.keys = keys
    // this.index = new MapOfMapOfSets()
    this.index = keys.reduce((ret, key) => {
      ret[key] = new MapOfSets()
      return ret
    }, {})
  }

  values () {
    return Array.from(this.store.values())
  }

  set (id, obj) {
    if (this.store.has(id)) this._clear(id)
    this.store.set(id, obj)
    this._index(id, obj)
  }

  get (id) {
    return this.store.get(id)
  }

  has (id) {
    return this.store.has(id)
  }

  delete (id) {
    this._clear(id)
    this.store.delete(id)
  }

  by (key, value, single) {
    if (!this.index[key]) return null
    if (!this.index[key].has(value)) return null
    let ids = this.index[key].get(value)
    if (single) return this.store.get(ids.values().next().value)
    else return ids.map(id => this.store.get(id))
  }

  map (fn) {
    let entries = this.store.entries()
    if (!entries || !entries.length) return []
    else return entries.map((key, value) => fn(value))
  }

  _clear (id) {
    let obj = this.store.get(id)
    this.keys.forEach(key => {
      this.index[key].delete(obj[key], id)
    })
  }

  _index(id, obj) {
    this.keys.forEach(key => {
      if (obj[key] !== undefined) this.index[key].add(obj[key], id)
    })
  }

  // _buildIndex (key) {
    // this.index.deleteAll(key)
    // this.store.forEach(([id, obj]) => this._indexOne(id, obj))
  // }
}

module.exports = {
  MapOfSets,
  MapOfMaps,
  MapOfMapOfSets,
  IndexedMap
}

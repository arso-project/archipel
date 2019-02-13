const EventEmitter = require('events').EventEmitter

const hyperdb = require('../structures/hyperdb')
const network = require('./network')

const { IndexedMap } = require('@archipel/common/util/map')
const { asyncThunky, prom, withTimeout } = require('@archipel/common/util/async')
const { nestStorage, keyPair, hex } = require('@archipel/common/util/hyperstack')

function make (api, handlers) {
  api = api || {}
  handlers = handlers || {}
  const libraries = {}
  return {
    get (name) {
      if (libraries[name]) return libraries[name]
      else {
        let storage = nestStorage(api.storage, name)
        libraries[name] = new Library({ ...api, storage }, handlers)
      }
      return libraries[name]
    }
  }
}


function rpc (api, opts) {
  return {
    async open (name) {
      let library = api.hyperlib.get(name)
      await library.ready()
      this.session.library = name
      // return library.getState()
      return true
    },
    async openArchive (opts) {
      let library = await getLibrary(this.session)
      let archive = await library.openArchive(opts)
      let ret = await archive.serialize()
      return ret
    },

    async listArchives (opts) {
      let library = await getLibrary(this.session)
      let archives = await library.listArchives()
      archives = await Promise.all(archives.map(a => a.serialize()))
      let ret = {}
      for (let i of archives) {
        ret[i.key] = i
      }
      return ret
    },

    async share (key) {
      let library = await getLibrary(this.session)
      return library.share(key)
    },

    async unshare (key) {
      let library = await getLibrary(this.session)
      return library.unshare(key)
    },

    async statsStream () {
      let library = await getLibrary(this.session)
      return library.network.createStatsStream()
    }
  }

  async function getLibrary (session) {
    if (!session.library) throw new Error('No library open.')
    let library = api.hyperlib.get(session.library)
    await library.ready()
    return library
  }
}

class Library extends EventEmitter {
  constructor (api, handlers) {
    super()

    this.archives = new IndexedMap(['key', 'type'])
    this.structures = new IndexedMap(['key', 'type', 'archive'])
    this.network = network()

    this.state = {}

    this.handlers = handlers || {}

    this.storage = api.storage

    this._init = false

    // this.state = new Map()

    let rootStorage = nestStorage(this.storage, 'root')
    this.root = hyperdb.structure({ valueEncoding: 'json' }, { storage: rootStorage })

    // this.root = new Archive()
    // this.root.setPrimary({ type: 'hyperdb', storage: rootStorage, handler: this.handlers.hyperdb)
    // this.root = new Archive('hyperdb', {}, { storage: rootStorage }, this.handlers)

    this.ready = asyncThunky(this._ready.bind(this))
  }

  async _ready () {
    await this.loadArchives()
  }

  async loadArchives () {
    await this.root.ready()
    this._loading = true
    let archives = await this.root.api.list('archive')

    if (!archives) return

    let promises = archives.map(a => a[0].value).map(info => {
      let worker = this.openArchive(info)
      let [promise, done] = prom()
      worker
        .then(success => done(null, { success, info }))
        .catch(error => done(null, { error, info }))
      return promise
    })

    let results = await Promise.all(promises)
    results.forEach(r => {
      if (r.error) console.error(`Opening archive ${r.info.type} ${r.info.key} failed:`, r.error)
    })
    this._loading = false
  }

  async storeInfo () {
    if (this._loading) return
    await this.ready()
    const promises = this.archives.values().map(a => {
      let key = hex(a.key)
      return this.root.api.put('archive/' + key, {
        key: key,
        type: a.type,
        state: this.state[key]
      })
    })
    let res = await Promise.all(promises)
    return res
  }

  // useHandler (name, handler) {
    // this.handlers[name] = handler
  // }

  // useApi (name, api) {
    // this.api[name] = api
  // }

  getArchive (key) {
    key = hex(key)
    if (this.archives.has(key)) return this.archives.get(key)
  }

  async openArchive (opts) {
    const self = this
    const { key, type } = opts
    if (key && this.archives.has(key)) return this.archives.get(key)
    if (!type) throw new Error('Type for primary structure is required.')

    try {
      const archive = await withTimeout(open(), 1000)
      await self.storeInfo()
      return archive
    } catch (e) { 
      console.error(e)
      throw new Error(`Cannot open archive: ${type} ${key}. Reason: ${e.message}`)
    }

    async function open () {
      const archive = new Archive(type, opts, self.handlers, { storage: self.storage })
      archive.on('structure', s => self.structures.set(s.key, s))
      await archive.ready()
      const key = hex(archive.key)

      self.archives.set(key, archive)
      self.state[key] = {}

      if (opts.share) {
        self.share(key)
      }

      return archive
    }
  }

  async listArchives () {
    await this.ready()
    return this.archives.values()
  }

  // Make sharing session persistent
  async share (key) {
    if (!this.archives.has(key)) return
    // this.state[key].share = true
    this.network.share(this.archives.get(key))
    await this.storeInfo()
    this.archives.get(key).status.share = true
    return this.archives.get(key).serialize()
  }

  async unshare (key) {
    if (!this.archives.has(key)) return
    // this.state[key].share = false 
    this.network.unshare(this.archives.get(key))
    await this.storeInfo()
    this.archives.get(key).status.share = false
    return this.archives.get(key).serialize()
  }
}

class Archive extends EventEmitter {
  constructor (type, opts, handlers, api) {
    console.log('Archive Constructor called')
    super()
    this.handlers = handlers
    this.api = api
    this.opts = opts
    this.type = type
    this.info = opts.info || {}
    this.status = {}

    this.structures = new IndexedMap(['type'])
    this.addStructure(type, { ...opts, primary: true }, true)
  }

  async ready () {
    await this.primary.ready()
    await this.loadStructures()
    this.key = this.primary.key

    let promises = this.structures.map(structure => structure.ready())
    return Promise.all(promises)
  }

  async serialize () {
    await this.ready()
    let structures = this.structures.values() || []
    return {
      key: hex(this.key),
      primary: hex(this.primary.key),
      info: this.info,
      status: this.status,
      structures: structures.map(s => s.getState())
    }
  }

  async addStructure (type, opts, persist) {
    const structure = this._addStructure(type, opts)
    if (persist) await this.storeStructures()
    this.emit('structure', structure)
    return structure
  }

  async storeStructures () {
    let structureInfo = this.structures.values().filter(s => !s.primary).map(s => {
      let optsToStore = ['key', 'type'].reduce((r, k) => {
        r[k] = s[k]
        return r
      }, {})
    })

    await this.primary.storeInfo({
      structures: structureInfo,
      info: this.info
    })
  }

  async loadStructures () {
    try {
      let info = await withTimeout(this.primary.fetchInfo(), 200)
      if (info.info) this.info = info.info
      if (!info.structures) return
      info.structures.map(async s => {
        let structure = this._addStructure(s)
        await structure.ready()
      })
    } catch (e) {}
  }

  _addStructure (type, opts) {
    if (!this.handlers[type]) throw new Error('Unknown type: ' + type)
    if (this.structures.by('type', type)) throw new Error('Multiple structures of the same type are not allowed.')

    const handler = this.handlers[type]
    const primary = opts.primary

    if (!opts.key) {
      let keys = keyPair()
      opts.secretKey = keys.secretKey
      opts.key = keys.publicKey
    }
    const key = opts.key

    const api = this.api
    if (opts.api) api = { ...api, ...opts.api }
    // todo: where should storage nesting take place?
    api.storage = nestStorage(api.storage, type, hex(key))

    const structure = handler(opts, api)

    structure.primary = primary
    structure.type = opts.type
    structure.key = key

    if (opts.info) structure.info = opts.info

    // structure.discoveryKey = discoveryKey(key)

    if (primary) this.primary = structure
    this.structures.set(hex(key), structure)
    return structure
  }

  getStructure (opts) {
    let structure = null
    if (!opts || opts.primary) structure = this.primary
    if (opts.key) structure = this.structures.get(hex(opts.key))
    if (opts.type) structure = this.structures.by('type', opts.type, true)
    return structure
  }
}

module.exports = {
  make,
  rpc,
  Library,
  Archive
}


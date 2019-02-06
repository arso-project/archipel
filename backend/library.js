const { IndexedMap } = require('./util/map')
const { asyncThunky, prom, withTimeout } = require('./util/async')
const EventEmitter = require('events').EventEmitter

const libraries = {}
const apis = {}
const handlers = {}

const api = exports.api = () => {
  return {
    useStructure (name, handler) {
      handlers[name] = handler
    },

    useApi (name, api) {
      apis[name] = api
    },

    get (name) {
      if (libraries[name]) return libraries[name]
      else {
        libraries[name] = new Library(name, handlers, api)
      }
    }
  }
}

const rpc = exports.rpc = (api, session) => ({
  async open (name) {
    let library = api.get(name)
    await library.ready()
    session.library = name
    return library.getState()
  }
})

class Library extends EventEmitter {
  constructor (name, handlers, api) {
    super()
    this.name = name

    this.archives = new IndexedMap(['key', 'type'])
    this.structures = new IndexedMap(['key', 'type', 'archive'])

    this.handlers = handlers || {}
    this.api = api || {}

    // this.state = new Map()
    let rootStorage = nestStorage(this.api.storage, root)
    this.root = new Archive('hyperdb', this.handlers, { storage })
    
    this.ready = asyncThunk(this._ready.bind(this))
  }

  async _ready () {
    await this.loadArchives()
  }

  async loadArchives () {
    await this.root.ready()
    let archives = await this.root.api.list('archives')

    if (!archives) return

    let promises = archives.map(info => {
      let worker = this.openArchive(info)
      let [promise, done] = prom()
      worker
        .then(success => done(null, { success, info }))
        .catch(error => done(null, { error, info }))
      return promise
    })

    let results = await Promise.all(promises)
    results.forEach(r => {
      if (r.error) console.err(`Opening archive ${info.type} ${info.key} failed:`, r.error)
    })
  }

  async storeInfo () {
    await this.ready()
    const promises = this.archives.map(a => {
      return this.root.put('archive/' + a.key, {
        key: a.key,
        type: a.type
      })
    })
    return Promise.all(promises)
  }

  useHandler (name, handler) {
    this.handlers[name] = handler
  }

  useApi (name, api) {
    this.api[name] = api
  }

  getArchive (key) {
    if (this.archives.has(key)) return this.archives.get(key)
  }

  async openArchive (opts) {
    const { key, type } = opts
    if (key && this.archives.has(key)) return this.archive.get(key)
    if (!type) throw new Error('Type for primary structure is required.')

    try {
      const archive = await withTimeout(open(), 1000)
      return archive
    } catch (e) { 
      throw new Error(`Cannot open archive: ${type} ${key}. Reason: ${e.message}`)
    }

    async function open () {
      const archive = new Archive(type, opts, handlers, api)

      archive.on('structure', s => this.structures.add(s.key, s))

      await archive.ready()

      this.archives.add(archive.key, archive)
      return archive
    }
  }
}

class Archive extends EventEmitter {
  constructor (type, opts, handlers, api) {
    super()
    this.handlers = handlers
    this.api = api

    this.structures = new IndexedMap(['type'])
    this._addStructure(opts, true)
  }

  async ready () {
    await this.primary.ready()
    await this.loadStructures()

    let promises = this.structures.map(s => s.ready())
    return Promise.all(promises)
  }

  async addStructure (opts, persist) {
    const structure = this._addStructure(opts)
    if (persist) await this.storeStructures()
    this.emit('structure', structure)
    return structure
  }

  async storeStructures () {
    let structureInfo = this.structures.filter(s => !s.primary).map(s => {
      let optsToStore = ['key', 'type'].reduce((r, k) => {
        r[k] = s[k]
        return r
      }, {})
    })

    await this.primary.storeInfo({
      structures: structureInfo
    })
  }

  async loadStructures () {
    let info = await this.primary.fetchInfo()
    if (!info.structures) return
    info.structures.map(async s => {
      let s = this._addStructure(s)
      await s.ready()
    })
  }

  _addStructure (opts, primary) {
    const type = opts.type
    if (!this.handlers[type]) throw new Error('Unknown type: ' + type)
    if (this.structures.by('type', type)) throw new Error('Multiple structures of the same type are not allowed.')

    const handler = this.handlers[type]

    if (!opts.key) {
      let keyPair = this.keyPair()
      opts.secretKey = keyPair.seretKey
      opts.key = keyPair.publicKey
    }
    const key = opts.key

    const api = this.api
    if (opts.api) api = { ...api, ...opts.api }
    // todo: where should storage nesting take place?
    api.storage = nestStorage(api.storage, type, key)

    const structure = handler(opts, api)

    structure.primary = primary
    structure.type = opts.type
    structure.key = key


    // structure.discoveryKey = discoveryKey(key)

    if (primary) this.primary = structure
    this.structures.add(key, structure)
  }

  getStructure (opts) {
    if (opts.key) return this.structures.get(opts.key)
    if (opts.type) return this.structures.by('type', opts.type)
    return null
  }
}


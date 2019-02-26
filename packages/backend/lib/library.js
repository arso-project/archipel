const EventEmitter = require('events').EventEmitter
const Readable = require('stream').Readable

const shallowEqual = require('shallowequal')
const hyperdb = require('../structures/hyperdb')
const network = require('./network')

const { IndexedMap } = require('@archipel/common/util/map')
const { asyncThunky, prom, withTimeout } = require('@archipel/common/util/async')
const { nestStorage, keyPair, hex } = require('@archipel/common/util/hyperstack')
const { createAuthCypher, decipherAuthRequest } = require('@archipel/common/util/authMessage')

const debug = require('debug')('library')

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

/*  #########################################
    ############ Exposed Api ################
    ######################################### */

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

    async authorizeWriter (key, writerKey, structures) {
      if (!structures) return this.authorizeWriter(key, writerKey, [key])
      let library = await getLibrary(this.session)
      let archive = await library.getArchive(key)
      let results = []
      for (let i of structures) {
        let structure = archive.structures.get(i)
        results.push(await structure.authorize(writerKey))
      }
      return results
    },

    async createStatsStream () {
      let library = await getLibrary(this.session)
      return library.network.createStatsStream()
    },

    async createArchiveStream (init) {
      let library = await getLibrary(this.session)
      const stream = new Readable({
        objectMode: true,
        read () {}
      })
      library.on('archive:update', async archive => {
        stream.push(await archive.serialize())
      })

      if (init) {
        library.listArchives().then(async archives => {
          archives.forEach(async archive => stream.push(await archive.serialize()))
        })
      }

      return stream
    },

    async requestAuthorizationMsg (key, structures, userMessage) {
      let library = await getLibrary(this.session)
      return createAuthCypher(library, { primaryKey: key, structures, userMessage })
    },

    async decipherAuthorizationMsg (authMessage) {
      let library = await getLibrary(this.session)
      return decipherAuthRequest(library, authMessage)
    },

    async debug (key) {
      return true
    }
  }

  async function getLibrary (session) {
    if (!session.library) throw new Error('No library open.')
    let library = api.hyperlib.get(session.library)
    await library.ready()
    return library
  }
}

/*  #########################################
    ############ Library ####################
    ######################################### */

class Library extends EventEmitter {
  constructor (api, handlers) {
    super()

    this.archives = new IndexedMap(['key', 'type'])
    this.structures = new IndexedMap(['key', 'type', 'archive'])
    this.network = network()

    this.state = {
      share: false
    }

    this.handlers = handlers || {}

    this.storage = api.storage

    let rootStorage = nestStorage(this.storage, 'root')
    this.root = hyperdb.structure({ valueEncoding: 'json' }, { storage: rootStorage })

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

  async storeArchive (archive) {
    if (this._loading) return
    let key = hex(archive.key)
    return this.root.api.put('archive/' + key, {
      key: key,
      type: archive.type,
      state: archive.state
    })
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

    if (!key) opts.create = true

    try {
      const archive = await withTimeout(open(), 5000)
      await self.storeArchive(archive)
      return archive
    } catch (e) { 
      console.error(`Cannot open archive: ${type} ${key}. Reason: ${e.message}`)
      return
    }

    async function open () {
      const archive = new Archive(type, opts, self.handlers, { storage: self.storage })

      archive.on('structure', s => self.structures.set(s.key, s))

      await archive.ready()

      const key = hex(archive.key)
      self.archives.set(key, archive)

      // Apply initial state.
      if (opts.state) {
        if (opts.state.share) {
          self.share(key)
        }
      }

      // Store info on state changes.
      archive.on('state', state => self.storeArchive(archive))

      // Forward update events.
      let updateEvents = ['state', 'structure', 'info', 'update']
      updateEvents.forEach(ev => archive.on(ev, () => self.emit('archive:update', archive)))

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
    this.network.share(this.archives.get(key))
    this.archives.get(key).setState({ share: true })
    return this.archives.get(key).serialize()
  }

  async unshare (key) {
    if (!this.archives.has(key)) return
    // this.state[key].share = false 
    this.network.unshare(this.archives.get(key))
    this.archives.get(key).setState({ share: false })
    return this.archives.get(key).serialize()
  }
}

/*  #########################################
    ############ Archive ####################
    ######################################### */

class Archive extends EventEmitter {
  constructor (type, opts, handlers, api) {
    super()
    this.handlers = handlers
    this.api = api
    this.opts = opts || {}
    this.type = type
    this.info = opts.create && opts.info ? opts.info : {}
    this.state = {}

    this.structures = new IndexedMap(['type'])

    this.ready = asyncThunky(this._ready.bind(this))

    this.primary = this._openStructure(type, opts)
  }

  async _ready () {
    const self = this
    // debug('start open archive', this.type, this.opts)
    await this.primary.ready()
    // debug('primary ready')

    this.key = hex(this.primary.key)
    this.localWriterKey = hex(this.primary.structure().local.key)

    // If creating a new archive, store initial info.
    if (this.opts.create) {
      // debug('op: create!')
      await this.storeInfo()
      // debug('op: create! info stored')

    // Otherwise, try to load the info.
    } else {
      // debug('op: open!')
      try {
        await initFromInfo()
        // debug('op: open! info loaded')
      } catch (e) {
        console.error('Error loading info for ' + this.key, e)
      }
    }

    this.primary.watchInfo(async () => {
      try {
        await initFromInfo()
        this.emit('info')
        // debug('info changed: loaded', this.info)
      } catch (e) {
        console.error('Error loading after watch', this.key, e)
      }
    })

    async function initFromInfo () {
      let info = await withTimeout(self.primary.fetchInfo(), 1000)
      if (info.structures) {
        await self.loadStructures(info.structures)
      }
      if (info.info) {
        await self.setInfo(info.info)
      }
    }
  }

  async serialize () {
    let structures = []
    this.structures.forEach(([key, s]) => {
      if (s !== this.primary) structures.push({ ...s.getState(), key })
      // structures.push({ ...s.getState(), key })
    })

    let state = this.getState()

    return {
      key: hex(this.key),
      localWriterKey: hex(this.localWriterKey),
      type: this.type,
      info: this.info,
      state: state,
      structures
    }
  }

  setState (newState) {
    if (!shallowEqual(newState, this.state)) {
      this.state = newState
      this.emit('state', this.state)
    }
  }

  getState () {
    let state = { ...this.state, ...this.primary.getState() }
    return state
  }

  async authorizeWriter (writerKey) {
    await this.ready()
    return this.primary.authorize(writerKey)
  }

  async createStructure (type, opts) {
    await this.ready()
    // if (!this.writable) throw new Error('Cannot write to this archive')
    const structure = await this.openStructure(type, { ...opts, create: true })
    await this.storeInfo()
    return structure
  }

  async openStructure (type, opts) {
    opts = opts || {}
    const structure = this._openStructure(type, opts)
    await structure.ready()
    this.emit('structure', structure)
    return structure
  }

  async setInfo (info, save) {
    this.info = { ...this.info, ...info }
    if (save) await this.storeInfo()
  }

  async storeInfo () {
    if (!this.getState().writable) {
      throw new Error('Cannot storeInfo, not writable', this.key)
      return // todo: throw error?
    }
    let info = await this.serialize()
    info.state = undefined
    await this.primary.storeInfo(info)
  }

  async loadStructures (structures) {
    for (let i = 0; i < structures.length; i++) {
      let info  = structures[i]
      let { type, key } = info
      if (this.structures.has(key)) continue
      let structure = this._openStructure(type, info)
      await structure.ready()
    }
  }

  _openStructure (type, opts) {
    opts = opts || {}
    if (!this.handlers[type]) throw new Error('Unknown type: ' + type)
    if (!opts.create && !opts.key) throw new Error('Either key or create must be set.')
    // if (this.structures.by('type', type)) throw new Error('Multiple structures of the same type are not allowed.')

    const handler = this.handlers[type]

    opts.type = type

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

    structure.type = opts.type
    structure.key = key

    // structure.discoveryKey = discoveryKey(key)

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


const p = require('path')
const hyperdb = require('hyperdb')
const pify = require('pify')
const { prom } = require('../util/async')

// exports.name = 'hyperdb'
// exports.label = 'Hyperdb'

exports.needs = ['hyperlib']

// hyperdb rpc
// -
exports.rpc = (api, session) => {
  return {
    async list (key, prefix) {
      const db = await getHyperdb(key)
      const res = await db.list(prefix)
      return res
    },

    async get (key, path) {
      const db = await getHyperdb(key)
      const res = await db.get(path)
      return res
    },

    async put (key, path, value) {
      const db = await getHyperdb(key)
      return db.put(path, value)
    }
  }

  async function getHyperdb (key) {
    if (!session.library) throw new Error('No library open.')
    const library = await api.hyperlib.get(session.library)
    const archive = await library.getArchive(key)
    return archive.getStructure('hyperdb')
  }
}

// hyperdb structure
// -
exports.structure = (opts, api) => {
  const key = opts.key
  const db = hyperdb(api.storage, key, opts)

  const structure = {
    async ready () {
      const [promise, done] = prom()
      db.ready(() => {
        db.put('__KEY__', db.key, done)
      })
      return promise
    },

    replicate (opts) {
      return db.replicate(opts)
    },

    getState () {
      return {
        type: 'hyperdb',
        key: this.db.key
      }
    },

    async storeInfo (info) {
      await structure.api.put('___hyperlib___', JSON.stringify(info, null, 2))
    },

    async fetchInfo () {
      try {
        let info = await structure.api.get('___hyperlib___')
        info = JSON.parse(info)
        return info
      } catch (e) {
        return
      }
    },

    api: {}
  }

  // Expose methods from hyperdb as api.
  // Todo: Document available api.
  const asyncFuncs = ['ready', 'put', 'get', 'list']
  asyncFuncs.forEach(func => {
    structure.api[func] = pify(db[func].bind(db))
  })

  return structure
}


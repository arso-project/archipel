const p = require('path')
const hyperdb = require('hyperdb')
const pify = require('pify')
const { prom } = require('@archipel/common/util/async')
const { hex } = require('@archipel/common/util/hyperstack')

// exports.name = 'hyperdb'
// exports.label = 'Hyperdb'

exports.needs = ['hyperlib']

// hyperdb rpc
// -
exports.rpc = (api, rpc, session) => {
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

    structure () {
      return db
    },

    replicate (opts) {
      return db.replicate(opts)
    },

    feeds () {
      return [...db.feeds, db.contentFeeds]
    },

    getState () {
      return {
        type: 'hyperdb',
        key: hex(this.db.key)
      }
    },

    authorized (key) {
      key = Buffer.from(key, 'hex')
      return new Promise((resolve, reject) => {
        db.authorized(key, async (err, res) => {
          if (err) return reject(err)
          resolve(res)
        })
      })
    },

    async authorize (key) {
      const self = this
      key = Buffer.from(key, 'hex')
      if (await self.authorized(key)) return null
      return new Promise((resolve, reject) => {
        db.authorize(key, async (err, res) => {
          if (err) reject(err)
          if (res) {
            // Hack: Do a write after the auth is complete.
            // Without this, hyperdrive breaks when loading the stat
            // for the root folder (/). I think this is a bug in hyperdb.
            await db.put('.foo', Buffer.from(''))
            resolve(true)
          }
        })
      })
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


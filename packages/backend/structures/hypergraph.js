const p = require('path')
const hypergraph = require('hyper-graph-db')
const pify = require('pify')
const { prom } = require('@archipel/common/util/async')
const { hex } = require('@archipel/common/util/hyperstack')

// exports.name = 'hypergraph'
// exports.label = 'Hypergraph'

exports.needs = ['hyperlib']

// hypergraph rpc
// -
exports.rpc = (api, opts) => {
  return {
    // async list (key, prefix) {
      // const db = await getHypergraph(key)
      // const res = await db.list(prefix)
      // return res
    // },

    async get (key, query) {
      const db = await getHypergraph(this.session, key)
      const res = await db.get(query)
      return res
    },

    async put (key, triples) {
      const db = await getHypergraph(this.session, key)
      return db.put(triples)
    }
  }

  async function getHypergraph (session, key) {
    if (!session.library) throw new Error('No library open.')
    const library = await api.hyperlib.get(session.library)
    const archive = await library.getArchive(key)
    let structure = await archive.getStructure({ type: 'hypergraph'})
    if (!structure) {
      structure = await archive.createStructure('hypergraph')
    }
    return structure.api
  }
}

// hypergraph structure
// -
exports.structure = (opts, api) => {
  const key = opts.key
  const db = hypergraph(api.storage, key, opts)

  const self = {
    async ready () {
      const [promise, done] = prom()
      db.ready(() => {
        done()
        // db.put({ subject'__KEY__', db.key, done)
      })
      return promise
    },

    structure () {
      // Return the underlying hyperdb.
      return db.db
    },

    replicate (opts) {
      return db.replicate(opts)
    },

    feeds () {
      let hyperdb = db.db
      return [...hyperdb.feeds, hyperdb.contentFeeds]
    },

    getState (includeFeeds) {
      let state = {
        type: 'hypergraph',
        key: hex(db.db.key),
        discoveryKey: hex(db.discoveryKey),
        writable: self.writable
      }
      if (includeFeeds) state.feeds = self.getFeedState()
      return state
    },

    authorized (key) {
      key = Buffer.from(key, 'hex')
      return new Promise((resolve, reject) => {
        db.db.authorized(key, async (err, res) => {
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
        db.db.authorize(key, async (err, res) => {
          if (err) reject(err)
          if (res) {
            // Hack: Do a write after the auth is complete.
            // Without this, hyperdrive breaks when loading the stat
            // for the root folder (/). I think this is a bug in hyperdb.
            console.log('authorized writer')
            resolve(true)
          }
        })
      })
    },
    // async storeInfo (info) {
      // await structure.api.put('___hyperlib___', JSON.stringify(info, null, 2))
    // },

    // async fetchInfo () {
      // try {
        // let info = await structure.api.get('___hyperlib___')
        // info = JSON.parse(info)
        // return info
      // } catch (e) {
        // return
      // }
    // },

    api: {}
  }

  // Expose methods from hypergraph as api.
  // Todo: Document available api.
  const asyncFuncs = ['ready', 'put', 'get']
  asyncFuncs.forEach(func => {
    self.api[func] = pify(db[func].bind(db))
  })

  return self
}


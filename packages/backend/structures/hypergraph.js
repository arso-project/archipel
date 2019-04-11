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
      // console.log('get query:', query)
      const res = await db.get(query)
      // console.log('got:', res)
      return res
    },

    async put (key, triples) {
      const db = await getHypergraph(this.session, key)
      // db.put(triples, (err, res) => {
      //   if (err) console.warn('Error putting entries:', err)
      //   console.log('Put entries:', res)
      // })
      let res = await db.put(triples)
      console.log('PUTres:', res)
      return res
    },

    async del (key, triples) {
      const db = await getHypergraph(this.session, key)
      db.del(triples, (err, res) => {
        if (err) return console.warn('Error deleting entries:', err)
        console.log('Deleted Entries:', res)
      })
      // return db.put(newTriples, (err, res) => {
      //   if (err) console.warn('Error putting entries:', err)
      //   console.log('Put entries:', res)
      // })
    },

    async searchSubjects (key, pattern, limit) {
      const db = await getHypergraph(this.session, key)
      console.log(db)
      // if (Array.isArray(pattern)) pattern = pattern[0]
      let res = db.searchSubjects(pattern, { limit: limit })
      return res
    },

    async query (key, query) {
      const db = await getHypergraph(this.session, key)
      let res = db.query(query, (err, res) => {
        if (err) console.warn('Error at query', query, res)
        console.log('queried for', query, 'and got', res)
      })
      return res
    }
  }

  async function getHypergraph (session, key) {
    if (!session.library) throw new Error('No library open.')
    const library = await api.hyperlib.get(session.library)
    const archive = await library.getArchive(key)
    let structure = await archive.getStructure({ type: 'hypergraph' })
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

    async get (triple, opts) {
      return new Promise((resolve, reject) => {
        db.get(triple, opts, (err, res) => {
          if (err) reject(err)
          resolve(res)
        })
      })
    },

    /*  AdHoc Solution for bad search of hyper-graph-db
        Problem: Dies not work with multiple search criteria
        TODO fork hyper-graph-db and implement working solution */
    /*  returns an array of { subject: 'xyz' } object, of matching all criteria */

    async searchSubjects (triples, opts) {
      if (!triples || !Array.isArray(triples)) return null

      // get results for all single criteria
      let res = []
      triples.forEach(t => res.push(self.get(t)))
      res = await Promise.all(res)
      res = res.flat()

      // scip the rest, in case of only one criterium
      if (triples.length <= 1) return res.map(triple => { return { subject: triple.subject } })

      // find those matching all criteriy
      let indices = new Array(res.length)
      indices.fill(1, 0)
      for (let i = 0; i < res.length; i++) {
        for (let j = i + 1; j < res.length; j++) {
          if (res[i].subject === res[j].subject) {
            indices[i]++ // = indices[i] + 1
            indices[j]++ // = indices[j] + 1
          }
        }
      }

      // construct the returned array
      let ret = []
      indices.forEach((n, i) => {
        if (n === triples.length) {
          let append = true
          ret.forEach(triple => {
            if (res[i].subject === triple.subject) append = false
          })
          if (append) ret.push({ subject: res[i].subject })
        }
      })

      return ret
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

    api: { }
  }

  // Expose methods from hypergraph as api.
  // Todo: Document available api.
  const asyncFuncs = ['ready', 'put', 'del']
  asyncFuncs.forEach(func => {
    self.api[func] = pify(db[func].bind(db))
  })
  self.api['get'] = self.get.bind(self)
  self.api['searchSubjects'] = self.searchSubjects.bind(self)

  return self
}


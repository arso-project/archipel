const p = require('path')
const mime = require('mime-types')
const hyperdrive = require('hyperdrive')
const pify = require('pify')
const { prom } = require('@archipel/common/util/async')
const { hex } = require('@archipel/common/util/hyperstack')
const Readable = require('stream').Readable
const EventEmitter = require('events').EventEmitter

let Stat = require('hyperdrive/lib/stat')

// exports.name = 'hyperdrive'
// exports.label = 'Hyperdrive'

exports.needs = ['hyperlib']

// hyperdrive rpc
// -
exports.rpc = (api, opts) => {
  return {
    async stat (key, path, depth) {
      maybeWatch(this.session, key)
      const drive = await getHyperdrive(this.session, key)
      depth = depth || 0
      let stat = await statPath(path, 0)
      return stat

      async function statPath (path, currentDepth) {
        let stat = await drive.stat(path)
        stat = cleanStat(stat, path, key)
        if (stat.isDirectory && currentDepth < depth) {
          stat.children = await statChildren(path, currentDepth + 1)
        }
        return stat
      }

      async function statChildren (path, currentDepth) {
        let children = await drive.readdir(path)
        children = children.filter(c => c)
        if (!children.length) return []
        let promises = children.map(name => statPath(joinPath(path, name), currentDepth))
        return await Promise.all(promises)
      }
    },

    async mkdir (key, path) {
      const drive = await getHyperdrive(this.session, key)
      const res = await drive.mkdir(path)
      return res
    },

    async readFile (key, path) {
      const drive = await getHyperdrive(this.session, key)
      const res = await drive.readFile(path)
      return res
    },

    async readFileStream (key, path) {
      const drive = await getHyperdrive(this.session, key)
      const rs = drive.createReadStream(path)
      return rs
    },

    async writeDerivedFile (key, path, name, buf) {
      const drive = await getHyperdrive(this.session, key)
      return drive.writeDerivedFile(path, name, buf)
    },

    async readDerivedFile (key, path, name) {
      const drive = await getHyperdrive(this.session, key)
      return drive.readDerivedFile(path, name)
    },

    async history (key, path) {
      const drive = await getHyperdrive(this.session, key)
      let res = await drive.history(path)
      res = res.map(nodes => {
        let node = nodes[0]
        let stat = cleanStat(Stat(node.value), path, key)
        stat.seq = node.seq
        stat.feed = node.feed
        return stat
      })
      return res
    },

    async createWriteStream (key, path) {
      const drive = await getHyperdrive(this.session, key)
      const stream = drive.createWriteStream(path)
      // console.log('start write')
      // stream.on('finish', () => console.log('finish write'))
      return stream
    },

    async writeFile (key, path, buf) {
      const drive = await getHyperdrive(this.session, key)
      return drive.writeFile(path, buf)
    },

    async createWatchStream () {
      let stream = getWatchStream(this.session)
      return stream
    },

    async watch (key) {
      await maybeWatch(this.session, key)
    }
  }


  async function getHyperdrive (session, key) {
    if (!session.library) throw new Error('No library open.')
    const library = await api.hyperlib.get(session.library)
    const archive = await library.getArchive(key)
    let drive = archive.getStructure({ type: 'hyperdrive' })
    return drive.api
  }

  function getWatchStream (session) {
    if (!session.hyperdriveWatchStream) {
      session.hyperdriveWatchStream = new Readable({
        objectMode: true,
        read () {}
      })
    }
    return session.hyperdriveWatchStream
  }

  async function maybeWatch (session, key) {
    session.hyperdriveWatching = session.hyperdriveWatching || []
    if (session.hyperdriveWatching.indexOf(key) !== -1) return
    session.hyperdriveWatching.push(key)

    const drive = await getHyperdrive(session, key)
    const stream = getWatchStream(session)
    const watcher = drive.watch()
    watcher.on('change', update)
    session.on('close', () => watcher.removeListener('change', update))
    function update () {
      stream.push({ key })
    }
  }




  // let watchlist = []
  // async function maybeWatch (req) {
    // if (!session.hyperdrive_watchlist) session.hyperdrive_watchlist = [
    // const { key } = req
    // if (watchlist.indexOf(key) > -1) return
    // watchlist.push(key)
    // const archive = await req.session.workspace.getArchive(key, 'hyperdrive')
    // archive.getInstance().on('change', () => {
      // core.rpc.request('drive/clearStats', { archive: key })
    // })
  // }
}

// hyperdrive structure
// -
exports.structure = (opts, api) => {
  const key = opts.key
  const drive = hyperdrive(api.storage, key, opts)

  let changeEmitter = null

  const self = {
    async ready () {
      const [promise, done] = prom()
      drive.ready(() => {
        let db = drive.db
        let localWriterKey = db.local.key
        db.authorized(localWriterKey, (err, res) => {
          if (err) throw err
          // if (res) self.setState({ authorized: true })
          self.writable = !!res
          // console.log('writable', hex(drive.key), res)
          done()
        })
      })
      return promise
    },

    replicate (opts) {
      return drive.replicate(opts)
    },

    getState (includeFeeds) {
      let state = {
        type: 'hyperdrive',
        key: hex(drive.key),
        discoveryKey: hex(drive.discoveryKey),
        writable: self.writable
      }
      if (includeFeeds) state.feeds = self.getFeedState()
      return state
    },

    getFeedState () {
      let metadataFeeds = drive.db.feeds.filter(f => f).map(mapFeeds).map(f => ({ ...f, type: 'metadata' }))
      let contentFeeds = drive.db.contentFeeds.filter(f => f).map(mapFeeds).map(f => ({ ...f, type: 'content' }))
      return  [ ...metadataFeeds, ...contentFeeds ]

      function mapFeeds (feed) {
        return {
          key: hex(feed.key),
          discoveryKey: hex(feed.discoveryKey),
          opened: feed.opened,
          writable: feed.writable,
          length: feed.length,
          byteLength: feed.byteLength,
          peers: feed.peers,
        }
      }
    },

    structure () {
      return drive.db
    },

    feeds () {
      const feeds = [...drive.db.feeds, ...drive.db.contentFeeds]
      return feeds
    },

    authorized (key) {
      key = Buffer.from(key, 'hex')
      return new Promise((resolve, reject) => {
        drive.db.authorized(key, async (err, res) => {
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
        drive.db.authorize(key, async (err, res) => {
          if (err) reject(err)
          if (res) {
            // Hack: Do a write after the auth is complete.
            // Without this, hyperdrive breaks when loading the stat
            // for the root folder (/). I think this is a bug in hyperdb.
            // await drive.db.put('', '')
            await drive.writeFile('.foo', Buffer.from(''))
            resolve(true)
          }
        })
      })
    },

    async storeInfo (info) {
      await self.api.writeFile('hyperlib.json', JSON.stringify(info, null, 2))
    },

    async fetchInfo () {
      try {
        let info = await self.api.readFile('hyperlib.json')
        info = JSON.parse(info)
        return info
      } catch (e) {
        return
      }
    },

    watchInfo (cb) {
      drive.db.watch('hyperlib.json', cb)
    }
  }

  self.api = {
    drive: drive,
    asyncWriteStream (path, stream) {
      return new Promise((resolve, reject) => {
        const ws = drive.createWriteStream(path)
        pump(stream, ws)
        ws.on('finish', () => resolve(true))
        ws.on('error', (err) => reject(err))
      })
    },

    watch () {
      if (!changeEmitter) {
        changeEmitter = new EventEmitter()
        drive.db.watch('/', () => changeEmitter.emit('change'))
      }
      return changeEmitter
    },

    history (path) {
      return new Promise((resolve, reject) => {
        const stream = drive.db.createKeyHistoryStream(path)
        let items = []
        stream.on('data', stat => items.push(stat))
        stream.on('end', () => resolve(items))
        stream.on('error', err => reject(err))
      })
    },

    async writeDerivedFile (path, name, buf) {
      let filepath = derivedPath(path, name)
      return self.api.writeFile(filepath, buf)
    },

    async readDerivedFile (path, name) {
      let filepath = derivedPath(path, name)
      let res = await self.api.readFile(filepath)
      return res
    },

    readFile (path) {
      const [promise, done] = prom()
      drive.readFile(path, (err, res) => {
        done(err, res)
      })
      return promise
    }
  }

  // Expose methods from hyperdrive as api.
  // Todo: Document available api.
  const asyncFuncs = ['ready', 'writeFile', 'readdir', 'mkdir', 'stat', 'authorize']
  asyncFuncs.forEach(func => {
    self.api[func] = pify(drive[func].bind(drive))
  })
  const syncFuncs = ['createWriteStream', 'createReadStream', 'replicate']
  syncFuncs.forEach(func => {
    self.api[func] = drive[func].bind(drive)
  })

  return self
}

function joinPath (prefix, suffix) {
  if (prefix.slice(-1) === '/') prefix = prefix.substring(0, prefix.length - 1)
  if (suffix[0] === '/') suffix = suffix.substring(1)
  return prefix + '/' + suffix
}

function cleanStat (stat, path, key) {
  let info = {
    key,
    path,
    name: p.parse(path).base,
    isDirectory: stat.isDirectory(),
    size: stat.size,
    mtime: stat.mtime.toISOString(),
    ctime: stat.ctime.toISOString(),
    mimetype: stat.isDirectory() ? 'archipel/directory' : mime.lookup(path),
    children: undefined
  }
  if (!info.mimetype) info.mimetype = 'archipel/unknown'
  return info
}

function derivedPath (path, name) {
  let dir = p.dirname(path)
  let base = p.basename(path)
  const filepath = p.join(dir, '.archipel-meta', base, name)
  return filepath
}

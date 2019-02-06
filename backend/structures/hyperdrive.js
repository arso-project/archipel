const p = require('path')
const archipelHyperdrive = require('./hyperdrive')
const mime = require('mime-types')
let Stat = require('hyperdrive/lib/stat')

// exports.name = 'hyperdrive'
// exports.label = 'Hyperdrive'

exports.needs = ['hyperlib']

// hyperdrive rpc
// -
exports.rpc = (api, session) => {
  return {
    async stat (key, path, depth) {
      // maybeWatch(api, session, req)
      const drive = await getHyperdrive(key)
      let stat = await drive.stat(path)
      stat = cleanStat(stat, path, key)

      if (stat.isDirectory && depth && depth > 1) {
        stat.children = await statChildren(stat.path, 0)
      }

      return stat

      async function statChildren (path, currentDepth) {
        let children = await drive.readdir(stat.path)
        children = children.filter(c => c)
        if (!children.length) return []
        children = await Promise.all(children.map(async name => {
          let stat = cleanStat(await drive.stat(joinPath(path, name))
          if (stat.isDirectory && currentDepth < depth) {
            stat.children = await getChildren(path, currentDepth + 1)
          })
        }))
        return children
      }
    },

    async mkdir (key, path) {
      const drive = await getHyperdrive(key)
      const res = await drive.mkdir(path)
      return res
    },

    async readFile (key, path) {
      const drive = await getHyperdrive(key)
      const res = await drive.readFile(path)
      return { content: res }
    },

    async readFileStream (key, path) {
      const drive = await getHyperdrive(key)
      const rs = drive.createReadStream(path)
      return {
        stream: rs,
        path: path
      }
    },

    async history (key, path) {
      const drive = await getHyperdrive(key)
      let res = await drive.history(path)
      res = res.map(nodes => {
        let node = nodes[0]
        let stat = cleanStat(Stat(node.value), path, key)
        stat.seq = node.seq
        stat.feed = node.feed
        return stat
      })
      return { history: res }
    },

    async writeFile (key, path, stream) {
      const drive = await getHyperdrive(key)
      return drive.asyncWriteStream(path, stream)
    }
  }

  async function getHyperdrive (key) {
    if (!session.library) throw new Error('No library open.')
    const library = await api.hyperlib.get(session.library)
    const archive = await library.getArchive(key)
    return archive.getStructure('hyperdrive')
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
exports.structure = (opts, api) {
  const key = opts.key
  // const storage = nestStorage(api.storage, 'hyperdrive', key)
  const drive = hyperdrive(api.storage, key, opts)

  let changeEmitter = null

  const structure = {
    async ready (done) {
      const [promise, done] = prom()
      drive.ready(done)
      return promise
    },

    replicate (opts) {
      return drive.replicate(opts)
    }

    async storeInfo (info) {
      await structure.api.writeFile('hyperlib.json', JSON.stringify(info, null, 2))
    },

    async fetchInfo () {
      try {
        let info = await structure.api.readFile('hyperlib.json')
        info = JSON.parse(info)
        return info
      } catch (e) {
        return
      }
    }
  }

  structure.api = {
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
    }
  }

  // Expose methods from hyperdrive as api.
  // Todo: Document available api.
  const asyncFuncs = ['ready', 'readFile', 'writeFile', 'readdir', 'mkdir', 'stat', 'authorize']
  asyncFuncs.forEach(func => {
    structure.api[func] = pify(drive[func].bind(drive))
  })
  const syncFuncs = ['createWriteStream', 'createReadStream', 'replicate']
  syncFuncs.forEach(func => {
    structure.api[func] = drive[func].bind(drive)
  })

  return structure
}

function joinPath (prefix, suffix) {
  if (prefix.slice(-1) === '/') prefix = prefix.substring(0, prefix.length - 1)
  if (suffix[0] === '/') suffix = suffix.substring(1)
  return prefix + '/' + suffix
}

function cleanStat (stat, path, key) {
  return {
    key,
    path,
    name: p.parse(path).base,
    isDirectory: stat.isDirectory(),
    size: stat.size,
    mtime: stat.mtime,
    ctime: stat.ctime,
    mimetype: stat.isDirectory() ? 'archipel/directory' : mime.lookup(path),
    children: undefined
  }
}

const hyperdrive = require('hyperdrive')
const pify = require('pify')
const p = require('path')

const pump = require('pump')

module.exports = {
  mounts: [{
    name: 'fs',
    root: true,
    proxies: 'hyperdrive',
    proxy: Fs
  }],
  plugin: fsPlugin
}

function joinPath (prefix, suffix) {
  if (prefix.slice(-1) === '/') prefix = prefix.substring(0, prefix.length - 1)
  if (suffix[0] === '/') suffix = suffix.substring(1)
  return prefix + '/' + suffix
}

async function fsPlugin (core, opts) {
  core.rpc.reply('fs/stat', async (req) => {
    const { key, path } = req
    const fs = await _getFs(req)
    const stat = await fs.stat(path)
    const parentStat = cleanStat(stat, path, key)
    const stats = []

    if (stat.isDirectory()) {
      let children = await fs.readdir(path)
      if (children.filter(c => c).length) {
        parentStat.children = children
        const childStats = parentStat.children.map(async name => {
          let childPath = joinPath(path, name)
          let childStat = await fs.stat(childPath)
          return cleanStat(childStat, childPath, key)
        })
        const completed = await Promise.all(childStats)
        completed.forEach(stat => stats.push(stat))
      } else {
        parentStat.children = []
      }
    }

    stats.unshift(parentStat)

    return { stats }

    function cleanStat (stat, path, key) {
      return {
        key,
        path,
        name: p.parse(path).base,
        isDirectory: stat.isDirectory(),
        children: undefined
      }
    }
  })

  core.rpc.reply('fs/mkdir', async (req) => {
    const fs = await _getFs(req)
    return fs.mkdir(req.path)
  })

  core.rpc.reply('fs/readFile', async (req) => {
    const fs = await _getFs(req)
    const res = await fs.readFile(req.path)
    const str = res.toString()
    return { content: str }
  })

  core.rpc.reply('fs/writeFile', async (req) => {
    const fs = await _getFs(req)
    return fs.asyncWriteStream(req.path, req.stream)
  })
}

async function _getFs (req) {
  if (!req.session.workspace) throw new Error('No workspace.')
  let { key } = req
  const archive = await req.session.workspace.archive(key)
  await archive.ready()
  return archive.fs
}

// A promisified wrapper around hyperdrive.
function Fs (storage, key, opts) {
  if (!(this instanceof Fs)) return new Fs(storage, key, opts)
  const self = this
  this.hyperdrive = hyperdrive(storage, key, opts)
  this.db = this.hyperdrive.db

  // Copy functions from hyperdrive.
  const asyncFuncs = ['ready', 'readFile', 'writeFile', 'readdir', 'mkdir', 'stat']
  asyncFuncs.forEach(func => {
    self[func] = pify(self.hyperdrive[func].bind(self.hyperdrive))
  })
  const syncFuncs = ['createWriteStream', 'createReadStream']
  syncFuncs.forEach(func => {
    self[func] = self.hyperdrive[func].bind(self.hyperdrive)
  })

  this.asyncWriteStream = (path, stream) => {
    return new Promise ((resolve, reject) => {
      const ws = this.hyperdrive.createWriteStream(path)
      pump(stream, ws)
      ws.on('finish', () => resolve(true))
      ws.on('error', (err) => reject(err))
    })
  }

  // Copy event bus.
  this.emit = (ev) => this.hyperdrive.emit(ev)
  this.on = (ev, cb) => this.hyperdrive.on(ev, cb)

  // Copy static props.
  const props = ['key', 'discoveryKey', 'db']
  props.forEach(key => {
    self[key] = self.hyperdrive[key]
  })
}

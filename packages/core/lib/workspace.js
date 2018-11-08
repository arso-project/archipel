const hyperdb = require('hyperdb')
const events = require('events')
const inherits = require('inherits')
const pify = require('pify')
const netspeed = require('@jimpick/hyperdrive-network-speed')
// const netspeed = require('hyperdrive-network-speed')

const library = require('./library')
const { hex, chainStorage, asyncThunky } = require('./util')

module.exports = Workspace

function Workspace (storage, key, opts) {
  if (!(this instanceof Workspace)) return new Workspace(storage, key, opts)
  const self = this
  opts = opts || {}

  this.library = library(storage, { archiveTypes: opts.archiveTypes })

  this.key = key
  this.info = {}

  this.db = hyperdb(chainStorage(storage)('workspace'), key, {
    reduce: (a, b) => a,
    valueEncoding: 'json'
  })

  this.networkStats = {}

  this.ready = asyncThunky(this._ready.bind(this))

  this.library.on('archive', archive => {
    archive.on('set:state', () => self.saveArchive(archive.key))
  })

  this.ready()
}
inherits(Workspace, events.EventEmitter)

Workspace.prototype._ready = function (done) {
  const self = this
  const db = this.db
  db.ready(() => {
    // For empty databases, the get() method seems
    // to not invoke the callback at all.
    // @todo: I think this is a bug in hyperdb.
    if (!db.source.length && db.local.length < 2) return done()
    loadInfo()
  })

  function loadInfo () {
    db.get('info', (err, node) => {
      if (err) done(err)
      else if (node) this.info = node.value
      openArchives(done)
    })
  }

  function openArchives (done) {
    const rs = db.createReadStream('archive')
    let promises = []
    rs.on('data', (node) => {
      const { type, key, opts, status } = node.value
      return self.library.addArchive(type, key, opts, status)
    })
    rs.on('end', async () => {
      await Promise.all(promises)
      done()
    })
  }
}

Workspace.prototype.setInfo = function (info) {
  const self = this
  return new Promise((resolve, reject) => {
    let value = Object.assign({}, self.info, info)
    self.db.put('info', value, (err, res) => {
      if (err) return reject(res)
      self.info = value
      resolve(value)
    })
  })
}

Workspace.prototype.getInfo = async function () {
  return new Promise((resolve, reject) => {
    this.db.get('info', (err, node) => {
      if (err) return reject(err)
      else if (!node) return resolve({})
      return resolve(node.value)
    })
  })
}

Workspace.prototype.getArchive = async function (key) {
  return this.library.getArchive(key)
}

Workspace.prototype.createArchive = async function (type, info, opts) {
  const archive = await this.library.createArchive(type, opts)
  archive.setState({ share: false })
  if (info && archive.setInfo) await archive.setInfo(info)
  await this.saveArchive(archive.key)
  return archive
}

Workspace.prototype.addRemoteArchive = async function (type, key, opts) {
  const archive = await this.library.addRemoteArchive(type, key, opts)
  await this.saveArchive(archive.key)
  return archive
}

Workspace.prototype.getPrimaryArchivesWithInfo = async function () {
  const self = this
  await this.ready()
  let archives = this.library.getPrimaryArchives()
  return Promise.all(archives.map(archive => self.getStatusAndInfo(archive.key)))
}

Workspace.prototype.getStatusAndInfo = async function (key) {
  let archive = this.library.getArchive(key)
  await archive.ready()
  let info = await archive.getInfo()
  let status = archive.getState()
  status.localWriterKey = archive.instance.db.local.key.toString('hex')
  return { info, status, key: archive.key }
}

let timer = setInterval(() => (console.log('initiated NetworkStats timer')), 10000)
Workspace.prototype.collectNetworkStats = async function () {
  // let self = this

  if (timer) clearInterval(timer)
  let archives = this.library.getPrimaryArchives()
  archives.forEach(function (a) { a.netspeed = netspeed(a) })

  timer = setInterval(async () => {
    this.networkStats = await readNetStatsFromArchives()
    this.emit('newNetStats')
  }, 1000)

  async function readNetStatsFromArchives () {
    let netStats = {}
    archives.forEach(a => {
      netStats[a.key] = {
        peers: a.network ? a.network.connections.length : '/',
        downSpeed: a.netspeed.downloadSpeed,
        upSpeed: a.netspeed.uploadSpeed,
        downTotal: a.netspeed.downloadTotal,
        upTotal: a.netspeed.uploadTotal
      }
    })
    return netStats
  }
}

Workspace.prototype.getNetworkStats = async function () {
  console.log(this.networkStats)
  return this.networkStats
}

Workspace.prototype.saveArchive = async function (key) {
  const self = this
  const archive = this.library.getArchive(key)

  const value = {
    key,
    type: archive.type,
    status: archive.getState(),
    opts: {} // todo: support opts?
  }

  return new Promise((resolve, reject) => {
    let dbkey = keyToDbKey(key)
    self.db.put(dbkey, value, (err, res) => {
      return err ? reject(err) : resolve(value)
    })
  })
}

Workspace.prototype.setShare = async function (key, share) {
  const archive = this.library.getArchive(key)
  archive.setShare(share)
}

function keyToDbKey (key) {
  return 'archive/' + hex(key)
}

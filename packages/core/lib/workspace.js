const crypto = require('hypercore-crypto')
const hyperdb = require('hyperdb')
const events = require('events')
const datenc = require('dat-encoding')
const thunky = require('thunky')
const inherits = require('inherits')
const rpcify = require('hyperpc').rpcify
const pify = require('pify')

const Archive = require('./archive')

const { hex, chainStorage, keyToFolder, asyncThunk } = require('./util')

module.exports = Workspace

function Workspace (storage, key, opts) {
  if (!(this instanceof Workspace)) return new Workspace(storage, key, opts)
  events.EventEmitter.call(this)
  const self = this

  this.key = key || null

  this.archives = []
  this._byKey = {}

  this.info = {
    key: key.toString('hex')
  }
  this.opts = opts

  opts.reduce = (a, b) => a
  opts.valueEncoding = 'json'

  this._storage = chainStorage(storage)

  this.db = hyperdb(this._storage('workspace'), key, opts)

  // this.ready = thunky((done) => self._ready(done))
  this.ready = asyncThunk(this._ready.bind(this))

  // if (opts.info) this.updateInfo(opts.info)
}

inherits(Workspace, events.EventEmitter)

let idx = 0
Workspace.prototype._ready = function (done) {
  console.log('WS: %s, READY %s', this.key.toString('hex').substring(0, 4), idx++)
  const self = this
  const rs = this.db.createReadStream('archive')

  rs.on('data', (node) => {
    const archive = this._loadArchive(node.key)
    archive.on('ready', finish)
  })
  rs.on('end', () => finish())

  if (this.opts.new && this.opts.info) {
    this.updateInfo(this.opts.info, () => finish())
  } else {
    this.db.get('info', (err, node) => {
      if (err) return
      this.info = Object.assign({}, this.info, node.value)
      finish()
    })
  }

  var end = 0
  function finish () {
    if (end === 2) done()
  }
}

Workspace.prototype.archive = async function (key) {
  await this.ready()
  key = datenc.toStr(key)
  if (this._byKey[key] === undefined) return null
  const archive = this.archives[this._byKey[key]]
  await archive.ready()
  return archive
}

Workspace.prototype.getArchives = async function (cb) {
  await this.ready()
  await Promise.all(this.archives.map(a => a.ready()))
  const info = this.archives.map(a => a.info)
  return info
}

Workspace.prototype.updateInfo = function (info, cb) {
  this.info = Object.assign({}, this.info, info)
  this.db.put('info', this.info, () => {
    this.emit('info.update', this.info)
    if (cb) cb(null, this.info)
  })
}

Workspace.prototype.getInfo = async function () {
  await this.ready()
  return this.info
}

// Workspace.prototype.mount = function (archive, opts) {
//   this.archives.push(archive)
// }

Workspace.prototype.createArchive = function (info) {
  const keyPair = crypto.keyPair()
  const key = keyPair.publicKey
  const opts = {
    secretKey: keyPair.secretKey,
    info: info
  }

  const archive = this._loadArchive(key, opts)

  this.db.put('archive/' + datenc.toStr(key), {
    added: Date.now() / 1000,
    key: datenc.toStr(key),
    source: true
  })

  return archive
}

Workspace.prototype.addArchive = function (key, opts) {
  if (this._byKey[key]) return

  const archive = this._loadArchive(key, opts)

  this.db.put('archive/' + datenc.toStr(key), {
    added: Date.now() / 1000,
    key: datenc.toStr(datenc.toStr(key)),
    source: false
  })

  return archive
}

Workspace.prototype._loadArchive = function (key, opts) {
  key = datenc.toBuf(key)
  const name = 'archive/' + keyToFolder(key)
  const archive = Archive(this._storage(name), key, opts)
  this._pushArchive(archive)
  // archive.ready(() => this._pushArchive(archive))
  return archive
}

Workspace.prototype._pushArchive = function (archive) {
  const idx = this.archives.push(archive)
  // console.log('push archive', archive.key.toString('hex').substring(0, 8))
  this._byKey[hex(archive.key)] = idx - 1
  this.emit('archive', archive)
}


// Workspace.prototype.__hyperpc = {
//   override: {
//     archive: async function (key) { return rpcify(await this.archive(key)) },
//     // getArchives: async function () {
//     //   let archives = await this.getArchives()
//     //   console.log('ARCHIVES', archives)
//     //   return archives.map(a => rpcify(a))
//     // },
//     createArchive: async function (info) {
//       console.log('CREATE OVERRIDEN', info)
//       return rpcify(await this.createArchive(info))
//     }
//   }
// }

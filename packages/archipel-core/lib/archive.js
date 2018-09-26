const pify = require('pify')
const datenc = require('dat-encoding')
const hypergraph = require('hyper-graph-db')
const hyperdrive = require('hyperdrive')
const crypto = require('hypercore-crypto')
const inherits = require('inherits')
const events = require('events')
const thunky = require('thunky')
const rpcify = require('hyperpc').rpcify
const pickby = require('lodash.pickby')

const Fs = require('./fs')

const { hex, chainStorage, asyncThunk } = require('./util')

module.exports = Archive

function Archive (storage, key, opts) {
  if (!(this instanceof Archive)) return new Archive(storage, key, opts)
  events.EventEmitter.call(this)
  const self = this
  opts = opts || {}

  this.key = key
  this.secretKey = opts.secretKey || null
  this.discoveryKey = crypto.discoveryKey(this.key)

  this.mounts = []
  this._byName = {}
  this._byKey = {}
  this.fs = null
  this.graph = null

  this._opts = opts
  this._storage = chainStorage(storage)

  this.ready = asyncThunk(this._ready.bind(this))
}

inherits(Archive, events.EventEmitter)

Archive.prototype.mount = function (name, db, instance, opts) {
  opts = opts || {}
  let idx = this.mounts.push({
    key: db.key,
    db: db,
    instance: instance || db,
    name: name,
    is: opts.is ? opts.is : 'hyperdb',
    opts: opts
  })
  this._byName[name] = idx - 1
  this._byKey[hex(db.key)] = idx - 1
}

Archive.prototype.byName = function (name) {
  if (!this._byName.hasOwnProperty(name)) return null
  return this.mounts[this._byName[name]]
}

Archive.prototype.byKey = function (key) {
  key = hex(key)
  if (!this._byKey[key]) return null
  return this.mounts[this._byKey[key]]
}

Archive.prototype.replicate = function (opts) {
  this.mounts.forEach((mount) => {
    mount.db.replicate(opts)
  })
}

Archive.prototype._ready = async function () {
  try {
    let save = false
    save = await this._ensureFs()
    save = await this._ensureInfo(save)
    save = await this._ensureGraph(save)
    if (save) await this.saveInfo()

    this.emit('ready')
  } catch (e) {
    throw e
  }
}

Archive.prototype._ensureFs = async function () {
  if (this.fs) return
  let opts = {
    secretKey: this.secretKey || null,
    storeSecretKey: false
  }

  // const fs = hyperdrive(this._storage('fs'), this.key, opts)
  const fs = Fs(this._storage('fs'), this.key, opts)
  this.mount('fs', fs.db, {
    is: 'hyperdrive',
    instance: fs,
    persist: true
  })

  this.fs = fs

  await this.fs.ready
}

Archive.prototype._ensureInfo = async function (doSave) {
  try {
    const info = await this.fs.readFile('dat.json')
    this.info = JSON.parse(info.toString())
    // Merge in defaults.
    this.info = Object.assign({}, this.info, this._defaultInfo())
  } catch (e) {
    this.info = this._defaultInfo()
    doSave = true
  }
  return doSave
}

Archive.prototype._ensureGraph = async function (doSave) {
  if (this.graph) return

  let key
  if (this.info.archipel && this.info.archipel.mounts) {
    key = this.info.archipel.mounts.graph
  }
  if (!key) doSave = true
  // todo: inject secretKey?
  const graph = hypergraph(this._storage('graph'), key)

  this.mount('graph', graph.db, {
    is: 'hypergraph',
    instance: graph,
    persist: true
  })

  this.graph = graph

  await pify(this.graph.ready)
  return doSave
}

Archive.prototype.updateInfo = function (info, cb) {
  this.info = Object.assign({}, this.info, info)
  this.saveInfo(cb)
}

Archive.prototype.saveInfo = async function (cb) {
  const info = this.info

  var mountKeys = ['name', 'key', 'is', 'opts']
  info.archipel.mounts = this.mounts.reduce((ret, mount) => {
    if (mount.persist && mount.key !== this.key) ret.push(pickby(mount, (v, key) => mountKeys.indexOf(key) !== -1))
  }, [])

  const buf = Buffer.from(JSON.stringify(info, null, 2))
  await this.fs.writeFile('dat.json', buf)
  this.emit('info.update', this.info)
  if (cb) cb(null, this.info)
}

Archive.prototype._defaultInfo = function () {
  const info = {
    url: 'dat://' + datenc.toStr(this.fs.key),
    key: datenc.toStr(this.fs.key),
    archipel: {
      type: 'archipel-archive-v1',
      primary: true,
      mounts: {}
    }
  }
  return Object.assign({}, info, this._opts.info)
}

// Archive.prototype.__hyperpc = {
//   override: {
//     fs: function () { return rpcify(this.fs) },
//     graph: function () { return rpcify(this.graph) },
//     info: function () { return this.info }
//   }
// }

// Archive.prototype._defaultStorage = function (dir) {
//   return function (name) {
//     return path.join(dir, hex(this.discoveryKey), name)
//   }
// }

// Workspace.prototype._appendStorage = function (prefix) {
//   return function (name) {
//     return prefix + '/' + name
//   }
// }

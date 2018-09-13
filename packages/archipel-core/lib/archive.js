const pify = require('pify')
const encode = require('dat-encoding')
const hypergraph = require('hyper-graph-db')
const hyperdrive = require('hyperdrive')
const crypto = require('hypercore-crypto')
const path = require('path')
const inherits = require('inherits')
const events = require('events')
const thunky = require('thunky')
// const cbmaybe = require('call-me-maybe')

const { hex, ready, promise } = require('./util')

function Archive (storage, key, opts) {
  if (!(this instanceof Archive)) return new Archive(storage, key, opts)
  events.EventEmitter.call(this)

  this.key = key
  this.secretKey = opts.secretKey || null
  this.discoveryKey = crypto.discoveryKey(this.key)

  this.mounts = []
  this._byName = {}
  this._byKey = {}
  this.fs = null
  this.graph = null

  this._opts = opts
  this._storage = typeof storage === 'string' ? this._defaultStorage(storage) : storage

  this.ready = ready(thunky(this._ready))

  // // todo: try to get rid of all this syntax...
  // const ready = thunky(this._init)
  // this.ready = async (cb) => cbmaybe(cb, promise((reject, resolve) => {
  //   ready(err => err ? reject(err) : resolve())
  // }))
}

inherits(Archive, events.EventEmitter)

Archive.prototype.mount = function (name, db, instance, opts) {
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
  if (!this._byName[name]) return null
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

Archive.prototype._init = async function () {
  let save = false
  save = await this._ensureFs()
  save = await this._ensureInfo(save)
  save = await this._ensureGraph(save)
  if (save) await this.saveInfo()

  this.fs = this.byName('fs')
  this.graph = this.byName('graph')

  this.emit('ready')
}

Archive.prototype._ensureFs = async function () {
  if (this.fs) return
  let opts = {
    secretKey: this.secretKey || null,
    storeSecretKey: false
  }

  const fs = hyperdrive(this._storage('fs'), this.key, opts)
  this.mount('fs', fs.db, {
    is: 'hyperdrive',
    instance: fs,
    persist: true
  })

  await ready(this.fs.ready)
}

Archive.prototype._ensureInfo = async function (doSave) {
  try {
    this.info = await pify(this.fs.readFile)('dat.json')
  } catch (e) {
    this.info = this._defaultInfo()
    doSave = true
  }
  return doSave
}

Archive.prototype._ensureGraph = async function (doSave) {
  if (this.graph) return

  const key = this.info.archipel.mounts.graph || null
  if (!key) doSave = true
  // todo: inject secretKey?
  const graph = hypergraph(this._storage('graph'), key)

  this.mount('graph', this.graph.db, {
    is: 'hypergraph',
    instance: graph,
    persist: true
  })

  await ready(this.graph.ready)
  return doSave
}

Archive.prototype.saveInfo = async function (cb) {
  const info = this.info

  info.archipel.mounts = this.mounts.reduce((ret, mount) => {
    if (mount.persist && mount.key !== this.key) ret.push(mount)
  }, [])

  const str = JSON.stringify(info, null, 2)
  return pify(this.fs.writeFile('dat.json', str))
}

Archive.prototype._defaultInfo = function () {
  const info = {
    url: encode(this.fs.key),
    archipel: {
      type: 'archipel-archive-v1',
      primary: true,
      mounts: {}
    }
  }
  return Object.assign({}, info, this._opts.info)
}

Archive.prototype._defaultStorage = function (dir) {
  return function (name) {
    return path.join(dir, hex(this.discoveryKey), name)
  }
}

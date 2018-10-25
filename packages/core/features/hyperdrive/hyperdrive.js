const hyperdrive = require('hyperdrive')
const pify = require('pify')
const pump = require('pump')
const datenc = require('dat-encoding')

module.exports = ArchipelHyperdrive

function ArchipelHyperdrive (storage, key, opts) {
  if (!(this instanceof ArchipelHyperdrive)) return new ArchipelHyperdrive(storage, key, opts)
  const self = this
  this.hyperdrive = hyperdrive(storage, key, opts)
  this.db = this.hyperdrive.db

  this.info = null
  this.mounts = null

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
    return new Promise((resolve, reject) => {
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

// Workspace interface.

ArchipelHyperdrive.prototype.addMount = async function (mount) {
  this.mounts.push(mount)
  return this.setInfo()
}

ArchipelHyperdrive.prototype.getMounts = async function () {
  let info = await this.getInfo()
  return info.archipel.mounts
}

ArchipelHyperdrive.prototype.setInfo = async function (info) {
  info = info || {}
  let defaultInfo = this.info || this.defaultInfo()
  info = Object.assign({}, defaultInfo, info)
  info.archipel.mounts = this.mounts
  await this.writeFile('dat.json', JSON.stringify(info, null, 2))
}

ArchipelHyperdrive.prototype.getInfo = async function () {
  if (this.info) return this.info
  try {
    let info = await this.readFile('dat.json')
    this.info = JSON.parse(info.toString())
  } catch (e) {
    this.info = this._defaultInfo()
  }
  return this.info
}

ArchipelHyperdrive.prototype.defaultInfo = function () {
  const info = {
    url: 'dat://' + datenc.toStr(this.key),
    key: datenc.toStr(this.key),
    archipel: {
      type: 'archipel-hyperdrive-v1',
      mounts: {}
    }
  }
  return info
}

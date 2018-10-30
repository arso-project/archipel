const EventEmitter = require('events').EventEmitter
const inherits = require('inherits')

const { hex } = require('../util')

module.exports = Archive

function Archive (library, type, instance, state) {
  if (!(this instanceof Archive)) return new Archive(library, type, instance, state)

  this.instance = instance
  this.key = hex(instance.key)
  this.library = library
  this.state = state || {}
  this.ready = instance.ready
  this.type = type
  this.mounts = null
}

inherits(Archive, EventEmitter)

Archive.prototype.makePersistentMount = async function (prefix, type, opts) {
  opts = opts || {}
  const archive = await this.library.addMount(this.key, type, null, opts)
  const mountInfo = { prefix, type, key: archive.key, opts }
  await this.instance.addMount(mountInfo)
  this.pushMount(mountInfo)
  return archive
}

Archive.prototype.pushMount = function (mount) {
  this.mounts.push(mount)
}

Archive.prototype.loadMounts = async function () {
  await this.instance.ready()
  let mounts
  if (this.instance.getMounts) {
    mounts = await this.instance.getMounts()
  }
  this.mounts = mounts || []
}

Archive.prototype.getMounts = async function () {
  if (!this.mounts) await this.loadMounts()
  return this.mounts
}

Archive.prototype.getMount = async function (prefix) {
  let mounts = await this.getMounts()
  mounts = mounts.filter(m => m.prefix === prefix)
  if (mounts.length) return this.library.getArchive(mounts[0].key)
  return null
}

Archive.prototype.getMountInstance = async function (prefix) {
  const mount = await this.getMount(prefix)
  if (!mount) return null
  return mount.getInstance()
}

Archive.prototype.getInstance = function () {
  return this.instance
}

Archive.prototype.getInfo = async function () {
  if (this.instance.getInfo) return this.instance.getInfo()
  return {}
}

Archive.prototype.setInfo = async function (info) {
  if (this.instance.getInfo) return this.instance.setInfo(info)
  this.emit('set:info', info)
  return null
}

Archive.prototype.getState = function () {
  return this.state
}

Archive.prototype.setState = function (state) {
  this.state = { ...this.state, state }
  this.emit('set:state', this.state)
}

Archive.prototype.isPrimary = function () {
  return this.state.primary
}

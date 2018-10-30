const EventEmitter = require('events').EventEmitter
const inherits = require('inherits')

const { hex, asyncThunk } = require('../util')

module.exports = Archive

function Archive (library, type, instance, state) {
  if (!(this instanceof Archive)) return new Archive(library, type, instance, state)
  const self = this

  this.instance = instance
  this.key = hex(instance.key)
  this.library = library
  this.state = state || {}
  this.type = type
  this.mounts = []

  // this.ready = asyncThunk(this._ready.bind(this))
  this.ready = instance.ready
  this.ready(() => self.loadMounts())
}
inherits(Archive, EventEmitter)

Archive.prototype._ready = function (done) {
  // const self = this
  // console.log('DONE', done)
  // this.instance.ready(() => {
  //   let timeout = setTimeout(() => done(), 200)
  //   self.loadMounts().then(() => {
  //     clearTimeout(timeout)
  //     self.setState({ loaded: true })
  //     done()
  //   })
  // })
}

Archive.prototype.makePersistentMount = async function (prefix, type, opts) {
  await this.ready()
  if (!this.isAuthorized()) throw new Error('Archive is not writable.')
  opts = opts || {}
  const archive = await this.library.addMount(this.key, type, null, opts)
  const mountInfo = { prefix, type, key: archive.key, opts }
  await this.instance.addMount(mountInfo)
  this.pushMount(mountInfo)
  return archive
}

Archive.prototype.pushMount = function (mount) {
  this.mounts.push(mount)
  this.emit('mount', mount)
}

Archive.prototype.loadMounts = async function () {
  const self = this
  await this.instance.ready()
  let mounts
  if (this.instance.getMounts) {
    mounts = await this.instance.getMounts()
    mounts.forEach(mount => self.pushMount(mount))
  }
}

Archive.prototype.getMounts = async function () {
  await this.ready()
  return this.mounts
}

Archive.prototype.getMount = async function (prefix) {
  await this.ready()
  const mounts = this.mounts.filter(m => m.prefix === prefix)
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
  if (!this.isLoaded()) return {}
  if (this.instance.getInfo) return this.instance.getInfo()
  return {}
}

Archive.prototype.setInfo = async function (info) {
  if (!this.isLoaded()) return
  if (this.instance.getInfo) return this.instance.setInfo(info)
  this.emit('set:info', info)
  return null
}

Archive.prototype.getState = function () {
  return this.state
}

Archive.prototype.setState = function (state) {
  this.state = { ...this.state, ...state }
  this.emit('set:state', this.state)
}

Archive.prototype.isPrimary = function () {
  return this.state.primary
}

Archive.prototype.isLoaded = function () {
  return this.state.loaded
}

Archive.prototype.isAuthorized = function () {
  return this.isLoaded() && this.state.authorized
}

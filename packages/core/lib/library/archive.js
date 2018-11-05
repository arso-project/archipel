const EventEmitter = require('events').EventEmitter
const inherits = require('inherits')
const hyperdiscovery = require('hyperdiscovery')
const debug = require('debug')('archive')

const { hex, asyncThunky } = require('../util')

module.exports = Archive

function Archive (library, type, instance, state) {
  if (!(this instanceof Archive)) return new Archive(library, type, instance, state)
  const self = this
  this._loaded = false

  this.instance = instance
  this.db = instance.db
  this.key = hex(instance.key)
  this.library = library
  this.state = state || {}
  this.type = type
  this.mounts = []

  this.ready = asyncThunky(this._ready.bind(this))
  this.ready()
}
inherits(Archive, EventEmitter)

Archive.prototype._ready = async function (done) {
  const self = this
  this.instance.ready(async () => {
    if (self._loaded) return
    self._loaded = true
    await self.loadMounts()

    self.db.once('remote-update', () => self.setState({ loaded: true }))

    let db = this.getInstance().db
    let localWriterKey = db.local.key
    db.authorized(localWriterKey, (err, res) => {
      if (err) throw err
      if (res) self.setState({ authorized: true })
    })

    if (self.getState().share) {
      self.startShare()
    }

    done()
  })
}

Archive.prototype.makePersistentMount = async function (prefix, type) {
  await this.ready()
  if (!this.isAuthorized()) throw new Error('Archive is not writable.')

  const archive = await this.library.addMount(this.key, type, null)

  const mountInfo = { prefix, type, key: archive.key }
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
  if (!this.mounts) return []
  return this.mounts.map(mount => this.library.getArchive(mount.key))
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
  if (this.instance.getInfo) return this.instance.getInfo()
  return {}
}

Archive.prototype.setInfo = async function (info) {
  if (!this.isLoaded()) return
  if (this.instance.setInfo) return this.instance.setInfo(info)
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

Archive.prototype.setShare = async function (share) {
  this.setState({ share })
  if (share) {
    this.startShare()
  }
}

Archive.prototype.startShare = async function () {
  await this.ready()
  const instance = this.getInstance()
  const network = hyperdiscovery(instance.db)
  this.network = network
  network.on('connection', (peer) => console.log('got peer!'))

  // todo: really always share all mounts?
  let mounts = await this.getMounts()
  mounts.forEach(mount => {
    mount.startShare()
  })
}

Archive.prototype.networkStats = function () {
  if (!this.network) return []
  // return this.network.connections
  // console.log(this.network.connections)
  return [
    this.network.connections.length
  ]
}

Archive.prototype.authorizeWriter = function (key) {
  const self = this
  const db = this.db
  return new Promise((resolve, reject) => {
    key = Buffer.from(key, 'hex')
    db.authorized(key, (err, auth) => {
      if (err) return reject(err)
      if (auth === true) {
        resolve(true)
      }
      db.authorize(key, async (err, res) => {
        if (err) return reject(err)
        if (res) {
          // Hack: Do a write after the auth is complete.
          // Without this, hyperdrive breaks when loading the stat
          // for the root folder (/). I think this is a bug in hyperdb.
          await self.setInfo({})
          resolve(true)
        }
      })
    })
  })
}

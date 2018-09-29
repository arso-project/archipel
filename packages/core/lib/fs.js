const hyperdrive = require('hyperdrive')
const pify = require('pify')
const { pifyObj } = require('./util')

module.exports = Fs

// A promisified wrapper around hyperdrive.
function Fs (storage, key, opts) {
  if (!(this instanceof Fs)) return new Fs(storage, key, opts)
  const self = this
  this.hyperdrive = hyperdrive(storage, key, opts)

  // Copy functions from hyperdrive.
  const asyncFuncs = ['ready', 'readFile', 'writeFile', 'readdir', 'mkdir', 'stat']
  asyncFuncs.forEach(func => {
    self[func] = pify(self.hyperdrive[func].bind(self.hyperdrive))
  })
  const syncFuncs = ['createWriteStream', 'createReadStream']
  syncFuncs.forEach(func => {
    self[func] = self.hyperdrive[func].bind(self.hyperdrive)
  })

  // Copy event bus.
  this.emit = (ev) => this.hyperdrive.emit(ev)
  this.on = (ev, cb) => this.hyperdrive.on(ev, cb)

  // Copy static props.
  const props = ['key', 'discoveryKey', 'db']
  props.forEach(key => {
    self[key] = self.hyperdrive[key]
  })
}

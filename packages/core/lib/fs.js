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
  const funcs = ['ready', 'readFile', 'writeFile', 'readdir', 'mkdir', 'stat']
  funcs.forEach(func => {
    self[func] = pify(self.hyperdrive[func].bind(self.hyperdrive))
  })

  // Copy event bus.
  this.emit = (ev) => this.hyperdrive.emit(ev)
  this.on = (ev, cb) => this.hyperdrive.on(ev, cb)

  // Copy static props.
  const copy = ['key', 'discoveryKey', 'db']
  copy.forEach(key => {
    self[key] = self.hyperdrive[key]
  })
}

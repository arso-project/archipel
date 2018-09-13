const pify = require('pify')
const path = require('path')
const datenc = require('dat-encoding')
const crypto = require('hypercore-crypto')

module.exports = {
  promise,
  ready,
  hex,
  chainedStorage,
  inParent,
  omit,
  discoveryKey
}

function promise (fn) {
  return new Promise(fn)
}

async function ready (fn) {
  return pify(fn, { errorFirst: false })
}

function hex (buf) {
  if (!Buffer.isBuffer(buf)) return buf
  return buf.toString('hex')
}

function chainedStorage () {
  const prefixes = Array.from(arguments)
  return function () {
    const names = Array.from(arguments)
    const parts = prefixes.concat(names)
    return path.join.apply(path.join, parts)
  }
}

function inParent (parent, dir) {
  const relative = path.relative(parent, dir)
  return !!relative && !relative.startsWith('..') && !path.isAbsolute(relative)
}

function omit (obj, keys) {
  Object.keys(obj)
    .filter(key => keys.indexOf(key) < 0)
    .reduce((newObj, key) => Object.assign(newObj, { [key]: obj[key] }), {})
}

function discoveryKey (publicKey) {
  return crypto.discoveryKey(datenc.toBuf(publicKey)).toString('hex')
}

// async function athunky (thunk) {
//   if (cb)

// }
//   this.ready = async (cb) => cbmaybe(cb, promise((reject, resolve) => {
//     ready(err => err ? reject(err) : resolve())
//   }))
const path = require('path')
const datenc = require('dat-encoding')
const crypto = require('hypercore-crypto')
const thunky = require('thunky')

module.exports = {
  hex,
  chainStorage,
  omit,
  discoveryKey,
  keyToFolder,
  asyncThunky
}

/**
 * An async wrapper for thunky
 *
 * Usage:
 * let ready = asyncThunky(_ready)
 *
 * Where ready either returns a promise, or calls a callback that
 * it gets as first argument.
 *
 * Then, either call ready with a callback
 *    ready(cb)
 * or await it
 *    await ready()
 */
function asyncThunky (fn) {
  let thunk = thunky(fn)
  return function (cb) {
    if (cb) return thunk(cb)
    if (!cb) {
      return new Promise((resolve, reject) => {
        thunk(err => {
          if (err) reject(err)
          else resolve()
        })
      })
    }
  }
}

function keyToFolder (key) {
  const str = discoveryKey(key)
  return str
  // return str.substr(0, 40)
}

function hex (buf) {
  if (!Buffer.isBuffer(buf)) return buf
  return buf.toString('hex')
}

function chainStorage (parent) {
  return function (prefix) {
    if (typeof parent === 'function' || typeof parent === 'object') {
      return function (name) {
        return parent(path.join(prefix, name))
      }
    } else {
      return path.join(parent, prefix)
    }
  }
}

function omit (obj, keys) {
  Object.keys(obj)
    .filter(key => keys.indexOf(key) < 0)
    .reduce((newObj, key) => Object.assign(newObj, { [key]: obj[key] }), {})
}

function discoveryKey (publicKey) {
  return crypto.discoveryKey(datenc.toBuf(publicKey)).toString('hex')
}

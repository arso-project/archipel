const through = require('through2')

const READABLE = 1 // 10
const WRITABLE = 2 // 01

module.exports = {
  READABLE,
  WRITABLE,
  transform,
  isStream,
  isReadable,
  isWritable,
  isTransform,
  isObjectStream,
  getStreamType,
  pass,
  toObj,
  toBin,
  maybeConvert,
  isObject
}

function transform (handler) {
  return through.obj(function (chunk, enc, next) {
    chunk = handler(chunk)
    this.push(chunk)
    next()
  })
}

function isStream (obj) {
  return isObject(obj) && obj && (obj._readableState || obj._writableState)
}

function isReadable (obj) {
  return isStream(obj) && typeof obj._read === 'function' && typeof obj._readableState === 'object'
}

function isWritable (obj) {
  return isStream(obj) && typeof obj._write === 'function' && typeof obj._writableState === 'object'
}

function isTransform (obj) {
  return isStream(obj) && typeof obj._transform === 'function' && typeof obj._transformState === 'object'
}

function isObjectStream (stream) {
  if (isWritable(stream)) return stream._writableState.objectMode
  if (isReadable(stream)) return stream._readableState.objectMode
}

function getStreamType (stream) {
  var type = 0

  // Special handling for transform streams. If it has no pipes attached,
  // assume its readable. Otherwise, assume its writable. If this leads
  // to unexpected behaviors, set up a duplex stream with duplexify and
  // use either setReadable() or setWritable() to only set up one end.
  if (isTransform(stream)) {
    if (typeof stream._readableState === 'object' && !stream._readableState.pipes) {
      return READABLE
    } else {
      return WRITABLE
    }
  }

  if (isReadable(stream)) type = type | READABLE
  if (isWritable(stream)) type = type | WRITABLE

  return type
}

function pass (objectMode) {
  return through({objectMode})
}

function toObj () {
  return through.obj(function (chunk, enc, next) {
    this.push(JSON.parse(chunk))
    next()
  })
}

function toBin () {
  return through.obj(function (chunk, enc, next) {
    this.push(JSON.stringify(chunk))
    next()
  })
}

function maybeConvert (oneInObjMode, twoInObjMode) {
  if (oneInObjMode && !twoInObjMode) return toBin()
  if (!oneInObjMode && twoInObjMode) return toObj()
  if (oneInObjMode && twoInObjMode) return pass(true)
  if (!oneInObjMode && !twoInObjMode) return pass(false)
}

function isObject (obj) {
  return (typeof obj === 'object')
}

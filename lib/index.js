var multiplex = require('multiplex')
var duplexify = require('duplexify')
var through = require('through2')
var thunky = require('thunky')
var stream = require('stream')
var pump = require('pump')

var MANIFEST = 'M'
var REQUEST = '>'
var RESPONSE = '<'

var PROMISE = 'P'
var P_RESOLVE = 0
var P_REJECT = 1

var READABLE = 1 // 10
var WRITABLE = 2 // 01
var DUPLEX = 1 | 2 // 11

function hyperpc (api, opts) {
  opts = Object.assign({}, {
    name: '',
    id: 0,
    log: false,
    promise: false
  }, opts)

  var state = {
    api: api || [],
    remote: null,
    callbacks: {},
    transports: {},
    incoming: {},
    promises: {},
    cnt: 0,
    nonce: Math.round(Math.random() * 10000000),
    prefix: opts.prefix || null
  }

  var M = multiplex({objectMode: false}, onstream)

  var rpc = M.createSharedStream('rpc')
  var send = through.obj()
  var recv = through.obj()

  pump(send, maybeConvert(true, false), rpc)
  pump(rpc, maybeConvert(false, true), recv)

  recv.on('data', handleData)

  send.write([MANIFEST, Object.keys(state.api), state.nonce])

  if (opts.log) pump(send, toLog('send'))
  if (opts.log) pump(recv, toLog('recv'))

  var ready = thunky((cb) => M.on('remote', () => cb()))
  ready()

  M.on('debug', () => log(state))

  return M

  function handleData (data) {
    var type = data[0]
    switch (type) {
      case MANIFEST:
        handleManifest(data)
        break
      case REQUEST:
        ready(() => handleRequest(data))
        break
      case RESPONSE:
        ready(() => handleResponse(data))
        break
      case PROMISE:
        if (opts.promise) ready(() => handlePromise(data))
        break
    }
  }

  function handleManifest (data) {
    var [, manifest, remoteNonce] = data

    if (!state.prefix) state.prefix = calculatePrefix(state.nonce, remoteNonce)

    state.remote = manifest.reduce((remote, name) => {
      remote[name] = makeApiCall(name)
      return remote
    }, {})

    M.emit('remote', state.remote)
  }

  function makeApiCall (name) {
    return function () {
      var id = makeId()
      var args = prepareArgs(id, Array.from(arguments))
      send.push([REQUEST, name, id, args])

      if (opts.promise) {
        return new Promise((resolve, reject) => {
          state.promises[id] = [resolve, reject]
        })
      }
    }
  }

  function handleRequest (data) {
    var [, name, id, args] = data

    args = resolveArgs(id, args)
    var ret = state.api[name].apply(state.api[name], args)

    if (opts.promise && isPromise(ret)) preparePromise(id, ret)
  }

  function handleResponse (data) {
    var [, id, args] = data
    var func = getCallback(id)
    if (!func) return log(`Invalid callback ${id}`)
    func.apply(func, resolveArgs(id, args))
  }

  function preparePromise (id, promise) {
    promise.then(handle(P_RESOLVE), handle(P_REJECT))

    function handle (type) {
      return function () {
        var args = prepareArgs(id, Array.from(arguments))
        send.push([PROMISE, id, type, args])
      }
    }
  }

  function handlePromise (data) {
    var [, id, type, args] = data
    if (!state.promises[id]) return
    args = resolveArgs(id, args)
    log('handle promise')
    state.promises[id][type].apply(state.promises[id][type], args)
  }

  function resolveArgs (id, args) {
    return convertArgs('resolve', id, args)
  }

  function prepareArgs (id, args) {
    return convertArgs('prepare', id, args)
  }

  function convertArgs (step, id, args) {
    var MATCH = 0
    var PREPARE = 1
    var RESOLVE = 2

    var STEPS = {
      prepare: prepareArg,
      resolve: resolveArg
    }

    var TYPE_MAP = [
      [isError, prepareError, resolveError],
      [isFunc, prepareCallback, resolveCallback],
      [isStream, prepareStream, resolveStream],
      [() => true, (arg) => arg, (arg) => arg]
    ]

    return args.map((arg, i) => STEPS[step](arg, id, i))

    function prepareArg (arg, id, i) {
      return TYPE_MAP.reduce((preparedArg, functions, type) => {
        if (preparedArg === null && functions[MATCH](arg)) {
          preparedArg = [type, functions[PREPARE](arg, joinIds(id, i))]
        }
        return preparedArg
      }, null)
    }

    function resolveArg (arg, id, i) {
      var [type, data] = arg
      return TYPE_MAP[type][RESOLVE](data, joinIds(id, i))
    }
  }

  function prepareError (arg) {
    return { message: arg.message }
    // todo: somehow this does not alway work.
    // return Object.getOwnPropertyNames(arg).reduce((spec, name) => {
    //   spec[name] = arg[name]
    //   return spec
    // }, {})
  }

  function resolveError (spec, id) {
    var err = new Error()
    Object.getOwnPropertyNames(spec).map((name) => {
      err[name] = spec[name]
    })
    return err
  }

  function prepareCallback (arg, id) {
    state.callbacks[id] = arg
    return id
  }

  function resolveCallback (id) {
    return function () {
      var args = prepareArgs(id, Array.from(arguments))
      send.push([RESPONSE, id, args])
    }
  }

  function prepareStream (stream, id) {
    var type = streamType(stream)
    var objectMode = isObjectStream(stream)

    if (type & READABLE) {
      var rsT = getTransportStream(id, READABLE, stream)
      pump(stream, maybeConvert(objectMode, false), rsT)
    }
    if (type & WRITABLE) {
      var wsT = getTransportStream(id, WRITABLE, stream)
      pump(wsT, maybeConvert(false, objectMode), stream)
    }

    return [type, objectMode]
  }

  function resolveStream (spec, id) {
    var [type, objectMode] = spec
    var ds = objectMode ? duplexify.obj() : duplexify()

    if (type & READABLE) {
      var rs = through({objectMode})
      var rsT = getTransportStream(id, READABLE, rs)
      pump(rsT, maybeConvert(false, objectMode), rs)
      ds.setReadable(rs)
    }
    if (type & WRITABLE) {
      var ws = through({objectMode})
      var wsT = getTransportStream(id, WRITABLE, ws)
      pump(ws, maybeConvert(objectMode, false), wsT)
      ds.setWritable(ws)
    }

    return ds
  }

  function onstream (sT, name) {
    // stream names are: s-ID-TYPE
    var match = name.match(/^([a-zA-Z0-9.]+)-([0-3]){1}$/)

    if (!match) return console.error('received unrecognized stream: ' + name)

    var id = match[1]
    var type = match[2]

    sT.on('error', (err) => log(name, err))

    state.transports[`${id}-${type}`] = sT
  }

  function getTransportStream (id, type, stream) {
    var sid = `${id}-${type}`
    if (!state.transports[sid]) state.transports[sid] = M.createSharedStream(sid)
    return state.transports[sid]
  }

  function makeId () {
    return joinIds(state.prefix, state.cnt++)
  }

  function getCallback (id) {
    return state.callbacks[id]
  }

  function toLog (name) {
    return through.obj(function (chunk, enc, next) {
      log(name, Buffer.isBuffer(chunk) ? chunk.toString() : chunk)
      this.push(chunk)
      next()
    })
  }

  function log (...args) {
    if (!opts.log) return
    var s = state.prefix + (opts.name ? `=${opts.name}` : '')
    console.log('rpcstream [%s]:', s, ...args)
  }
}

module.exports = hyperpc

// Pure helpers.

function joinIds (...ids) {
  return ids.join('.')
}

function calculatePrefix (nonce, remoteNonce) {
  if (remoteNonce > nonce) return 'A'
  else if (remoteNonce < nonce) return 'B'
  else return 'X' + (Math.round(Math.random() * 1000))
}

function isFunc (obj) {
  return typeof obj === 'function'
}

function isError (arg) {
  return arg instanceof Error
}

function isPromise (obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function'
}

function isStream (obj) {
  return obj instanceof stream.Stream
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

function streamType (stream) {
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

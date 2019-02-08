const multiplex = require('multiplex')
const duplexify = require('duplexify')
const through = require('through2')
const pump = require('pump')
const msgpack = require('msgpack-lite')
const nanoid = require('nanoid')
const EventEmitter = require('events').EventEmitter

const { isStream, transform, getStreamType, READABLE, WRITABLE, isObjectStream, maybeConvert } = require('../util/stream')

module.exports = (opts) => new StreamBus(opts)

class StreamBus extends EventEmitter {
  constructor (opts) {
    super()
    const self = this
    opts = opts || {}

    this.localId = null
    this.remoteId = null

    this.stream = multiplex({ objectMode: false }, (stream, name) => {
      this.stransports.set(stream, name)
    })

    this.transports = new Map()

    this.queue = []
    this.receiveMessage = this.queue.push.bind(this.queue)

    const rpc = this.stream.createSharedStream('rpc')

    const mapArgs = (msg, fn) => {
      if (!msg.opts || !msg.opts.args) return msg
      msg.opts.args = msg.opts.args.map(arg => arg ? fn(arg) : arg)
      return msg
    }

    this.send = transform(msg => {
      msg = mapArgs(msg, arg => self.encodeArg(arg))
      msg = msgpack.encode(msg)
      return msg
    })

    this.recv = transform(msg => {
      msg = msgpack.decode(msg)
      msg = mapArgs(msg, arg => self.decodeArg(arg))
      return msg
    })

    this.recv.on('data', msg => {
      if (msg.type === 'hello') this.remoteId = msg.id
      this.receiveMessage(msg)
    })

    pump(this.send, rpc)
    pump(rpc, this.recv)
  }

  postMessage (msg) {
    if (msg.type === 'hello') this.localId = msg.id
    this.send.write(msg)
  }

  onmessage (fn) {
    if (this.queue.length) this.queue.forEach(msg => fn(msg))
    this.receiveMessage = msg => fn(msg)
  }

  getTransportStream (id, type) {
    var sid = `${id}-${type}`
    if (!this.transports.has(sid)) this.transports.set(sid, this.stream.createSharedStream(sid))
    return this.transports.get(sid)
  }

  encodeArg (arg) {
    if (isStream(arg.value)) {
      arg.valueid = nanoid()
      arg.valuetype = 'stream'
      arg.value = this.prepareStream(arg.value, arg.valueid)
    }
    return arg
  }

  decodeArg (arg) {
    if (arg.valuetype === 'stream') {
      arg.value = this.resolveStream(arg.value, arg.valueid)
      delete arg.valuetype
      delete arg.valueid
    }
    return arg
  }

  prepareStream (stream, id) {
    var streamType = getStreamType(stream)
    var objectMode = isObjectStream(stream)

    if (streamType & READABLE) {
      var rsT = this.getTransportStream(id, READABLE, stream)
      pump(stream, maybeConvert(objectMode, false), rsT)
    }
    if (streamType & WRITABLE) {
      var wsT = this.getTransportStream(id, WRITABLE, stream)
      pump(wsT, maybeConvert(false, objectMode), stream)
    }

    return { streamType, objectMode }
  }

  resolveStream (arg, id) {
    var { streamType, objectMode } = arg
    var ds = objectMode ? duplexify.obj() : duplexify()

    if (streamType & READABLE) {
      var rs = through({ objectMode })
      var rsT = this.getTransportStream(id, READABLE, rs)
      pump(rsT, maybeConvert(false, objectMode), rs)
      ds.setReadable(rs)
    }
    if (streamType & WRITABLE) {
      var ws = through({ objectMode })
      var wsT = this.getTransportStream(id, WRITABLE, ws)
      pump(ws, maybeConvert(objectMode, false), wsT)
      ds.setWritable(ws)
    }

    return ds
  }
}

module.exports.StreamBus = StreamBus


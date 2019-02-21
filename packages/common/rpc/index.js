const generate = require('nanoid/generate')
const nolookalikes = require('nanoid-dictionary/nolookalikes');
const debug = require('debug')('rpc')

const EventEmitter = require('events').EventEmitter

const { MapOfMaps } = require('../util/map')
const { prom, isPromise, withTimeout } = require('../util/async')

const nanoid = () => generate(nolookalikes, 8)

module.exports = opts => new RpcApi(opts)

class Peer {
  constructor (opts) {
    opts = opts || {}
    this.id = opts.id || null
    this.session = opts.session || new EventEmitter()
    this.api = opts.api || {}
    this.bus = opts.bus || {}

    this._callbacks = []
  }

  getCallback (id) {
    return this._callbacks[id - 1]
  }

  saveCallback (fn) {
    let idx = this._callbacks.push(fn)
    return idx
  }

  close () {
    // todo: more cleanup?
    this.session.emit('close')
  }
}

class RpcApi {
  constructor (opts) {
    opts = opts || {}
    this.api = opts.api || {}
    // this.rpcApi = opts.rpc || {}
    this.id = opts.id || nanoid()

    this.exposedApi = this._makeLocalApi(opts.rpc)
    // const localApi = this._makeLocalApi(initialState)
    this.timeout = opts.timeout || 2000 // todo: increase

    this.peers = new Map()
  }

  // use (name, create, opts) {
    // this.api[name] = { create, opts }
  // }

  addPeer (bus, initialState) {
    initialState = initialState || {}
    const [promise, done] = prom()
    let timeout = setTimeout(() => done(new Error('Timeout.')), 5000)

    // const localApi = this._makeLocalApi(initialState)

    const peer = new Peer({
      bus
    })

    bus.postMessage({ type: 'hello', id: this.id, methods: this.exposedApi.methods })
    bus.onmessage(msg => {
      debug('receive: %O', msg)
      if (msg.type === 'hello') {
        let { id, methods } = msg
        peer.id = id
        peer.api = this._makeRemoteApi(id, bus, methods)

        this.peers.set(id, peer)

        clearTimeout(timeout)
        done(null, peer)
      } else if (msg.type === 'close') {
        peer.close()
      } else if (peer.id === msg.from.peer) {
        this.postMessage(msg)
      } else {
        // this should never happen.
        console.error('Received message from unknown peer: ', msg)
      }
    })

    return promise
  }

  postMessage (msg) {
    if (msg.type === 'call' && msg.to.peer === this.id) return this.localCall(msg)
    else {
      // todo: handle?
      debug('Unhandled message', msg)
    }
  }

  localCall (msg) {
    const self = this
    let { from, to, args } = msg

    if (!this.peers.has(from.peer)) return console.error('Unknown peer: ' + from.peer)

    let peer = this.peers.get(from.peer)

    let fn
    if (to.method) {
      fn = to.method.split('.').reduce((ret, key) => {
        if (ret && ret[key]) return ret[key]
        else return null
      }, this.exposedApi.api)
    } else if (to.callback !== undefined) {
      fn = peer.getCallback(to.callback)
    }

    if (!fn || typeof fn !== 'function') {
      // todo: Error handling.
      return console.error('Cannot handle call: ', to)
    }

    args = this.decodeArgs(peer, args)

    let ret, res, err
    try {
      ret = fn.apply(peer, args)
      // console.log('RET', to, ret)
      if (isPromise(ret)) {
        if (this.timeout) ret = withTimeout(ret, this.timeout)
        ret
          .then(r => (res = r), e => (err = e))
          .finally(done)
      } else {
        res = ret
        done()
      }
    } catch (e) {
      err = e
      done()
    }

    function done () {
      if (err) {
        debug(`ERROR for call ${to.method} from peer ${from.peer}:`, err)
        if (err instanceof Error) err = err.message
      }
      if (from.callback !== undefined) {
        self.pushCall(from, [err, res], false)
      }
    }
  }

  pushCall (address, args, returnPromise) {
    let promise, done

    let peer = this.peers.get(address.peer)
    if (!peer) throw new Error('Unknown peer: ' + address.peer)

    let from = { peer: this.id }

    if (returnPromise) {
      [promise, done] = prom()
      from.callback = peer.saveCallback(done)
    }

    let msg = {
      type: 'call',
      from,
      to: address
    }

    msg.args = this.encodeArgs(peer, args)
    debug(`send (${peer.id}): %O`, msg)
    peer.bus.postMessage(msg)
    return promise
  }

  _makeRemoteApi (id, bus, methods) {
    let api = {}
    if (!methods) return api
    methods.map(name => {
      let cur = api
      let path = name.split('.')

      let fn = path.pop()
      path.forEach((el, i) => {
        cur[el] = cur[el] || {}
        cur = cur[el]
      })

      cur[fn] = (...args) => this.pushCall({ peer: id, method: name }, args, true)
    })
    return api
  }

  _makeLocalApi (rpcApi) {
    rpcApi = rpcApi || {}
    let build = {}
    Object.entries(rpcApi).forEach(([name, fn]) => {
      let opts = {}
      if (typeof fn === 'object' && fn.create) {
        opts = fn.opts
        fn = fn.create
      }
      if (typeof fn !== 'function') console.error('cannot create api', name, fn)
      build[name] = fn(this.api, opts)
    })

    let methods = []
    reduce(build, [])

    return { api: build, methods }

    function reduce (obj, path) {
      Object.entries(obj).forEach(([name, value]) => {
        if (typeof value === 'function') {
          methods.push([...path, name].join('.'))
        } else if (typeof value === 'object') {
          reduce(value, [...path, name])
        }
      })
    }
  }

  encodeArgs (peer, args) {
    if (!args || !args.length) return []
    return args.map(arg => {
      if (arg instanceof Error) throw arg // todo: how to deal with errors as args?
      if (typeof arg === 'function') return { type: 'callback', value: peer.saveCallback(arg) }
      return { type: 'value', value: arg }
    })
  }

  decodeArgs (peer, args) {
    if (!args || !args.length) return []
    return args.map(arg => {
      if (arg.type === 'callback') return (...args) => this.pushCall({ peer: peer.id, callback: arg }, args)
      if (arg.type === 'value') return arg.value
      else throw new Error('Unkown arg type: ' + arg.type)
    })
  }
}


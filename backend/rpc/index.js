const generate = require('nanoid/generate')
const nolookalikes = require('nanoid-dictionary/nolookalikes');

// const EventEmitter = require('events').EventEmitter

const { MapOfMaps } = require('../util/map')
const { prom, isPromise } = require('../util/async')

const nanoid = () => generate(nolookalikes, 8)
if (!setImmediate) {
  const setImmediate = fn => setTimeout(fn, 0)
}

module.exports = id => new RpcApi(id)

class RpcApi {
  constructor (id) {
    this.api = {}
    this.peers = new Map()
    this.id = id || nanoid()
  }

  use (name, create, opts) {
    this.api[name] = { create, opts }
  }

  addPeer (bus, initialState) {
    initialState = initialState || {}
    const [promise, done] = prom()
    let timeout = setTimeout(() => done(new Error('Timeout.')), 5000)

    const localApi = this._makeLocalApi(initialState)

    const peer = {
      bus,
      localApi,
      callbacks: []
    }

    bus.onmessage(msg => {
      if (msg.type === 'hello') {
        let { id, methods } = msg
        peer.id = id
        peer.api = this._makeRemoteApi(id, bus, methods)

        this.peers.set(id, peer)

        clearTimeout(timeout)
        done(null, peer)

      } else {
        this.postMessage(msg)
      }
    })

    setImmediate(() => {
      bus.postMessage({ type: 'hello', id: this.id, methods: localApi.methods })
    })

    return promise
  }

  postMessage (msg) {
    if (msg.type === 'call' && msg.to.peer === this.id) return this.localCall(msg)
    else console.log('Unhandled message', msg)
  }

  localCall (msg) {
    const self = this
    let { from, to, args } = msg

    if (!this.peers.has(from.peer)) throw new Error('Unknown peer: ' + from.peer)

    let peer = this.peers.get(from.peer)

    let fn
    if (to.method) {
      fn = to.method.split('.').reduce((ret, key) => {
        if (ret && ret[key]) return ret[key]
        else return null
      }, peer.localApi.api)
    } else if (to.callback !== undefined) {
      fn = peer.callbacks[to.callback]
    }

    if (!fn || typeof fn !== 'function') {
      // todo: Error handling.
      return console.error('Cannot handle call: ', to)
    }

    args = this.decodeArgs(peer, args)

    let ret, res, err
    try {
      ret = fn.apply(fn, args)
      if (isPromise(ret)) {
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
        console.error(`ERROR for call ${to.method} from peer ${from.peer}:`, err)
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
      from.callback = this.saveCallback(peer, done)
    }

    let msg = {
      type: 'call',
      from,
      to: address
    }

    msg.args = this.encodeArgs(peer, args)
    console.log('PUSH', msg)
    peer.bus.postMessage(msg)
    return promise
  }

  saveCallback (peer, cb) {
    let idx = peer.callbacks.push(cb)
    return idx - 1
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

  _makeLocalApi (initialState) {
    let state = initialState || {}
    let api = {}
    Object.entries(this.api).forEach(([name, { create, opts }]) => {
      api[name] = create(api, state, opts)
    })

    let methods = []
    reduce(api, [])

    return { api, methods, state }

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
      if (arg instanceof Error) throw arg // todo: how to deal with errors?
      // if (hasRef(arg)) return { type: 'ref', ref: getRef(arg) }
      if (typeof arg === 'function') return { type: 'callback', value: this.saveCallback(peer, arg) }
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


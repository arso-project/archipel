const isbuf = require('is-buffer')

const { queue } = require('../util/queue')
const S = require('../util/stream')

// TODO: This is unfinished.

class PostMessageBus {
  constructor (src, dst, origin) {
    const self = this
    this.src = src
    this.dst = dst
    this.recv = queue()

    if (origin === '*') {
      this.origin = '*';
    } else if (origin) {
        const uorigin = new URL(origin);
        this.origin = uorigin.protocol + '//' + uorigin.host;
    }

    this._onmessage = (ev) => {
      if (self._destroyed) return;
      if (self.origin !== '*' && ev.origin !== self.origin) return;
      if (!ev.data || typeof ev.data !== 'object') return;
      if (ev.data.protocol !== 'refspace') return;
      self._handle(ev.data);
    }

    this.src.addEventListener('message', this._onmessage);

  }

  onmessage (fn) {
    this.recv.take(fn)
  }

  postMessage (msg) {
    let [message, transfer] = this._encode(msg)

    if (this._dstIsWorker) {
      this.dst.postMessage(msg, transfer)
    } else {
      this.dst.postMessage(msg, this.origin, transfer)
    }
  }

  destroy () {
    this._destroyed = true;
    this.src.removeEventListener('message', this._onmessage);
  }

  _handle (msg) {
    if (data.type === 'msg') {
      this.recv.push(data)
    } else if (data.type === 'stream') {

    }
  }

  _encode (msg) {
    let transfer = []
    if (msg.opts.args) {
      let args = msg.opts.args
      args.forEach(arg => {
      })
    }
    let message = {
      protocol: 'refspace',
      type: 'msg',
      msg
    }
    return [message, transfer]
  }

  _encodeArg (arg, transfer) {
    if (isbuf(arg)) {
      transfer.push(arg)
    }
    if (isStream(arg)) {
      let id = nanoid()
      _handleStream(arg)
      arg.value = id
      arg.type 
    }
    return arg
  }

  _encodeStream (arg) {
    const type = S.getStreamType(arg)
    const msg = { protocol: 'refspace', type: 'stream', streamid: id, streamtype: type }
    const sendChunk = (chunk) => {
      let transfer = []
      if (isBuffer(chunk)) transfer.push(chunk)
      this.send({ ...msg, chunk }, transfer)
    }
    const sendEvent = (event) => {
      this.send({ ...msg, event })
    }

    setTimeout(() => {
      stream.on('error', () => sendEvent('error'))
      stream.on('close', () => sendEvent('close'))
      if (type & readable) {
        stream.on('data', data => sendChunk(data))
        stream.on('end', () => sendEvent('end'))
      }
      if (type & writable) {
        stream.on('finish', () => sendEvent('finish'))
        stream.on('drain', () => sendEvent('drain'))
      }
    })
  }

  _decodeStream (arg) {
    const { streamtype, streamid } = arg
    const stream = makeStream(streamtype)

  }

  _decodeStreamMessage (msg) {
    const { streamid, chunk, event } = msg
    if (!this.streams.has(streamid)) throw new Error('Received unknown stream: ' + streamid)
    const stream = this.streams.get(streamid)
    if (chunk) {
      stream.push(chunk)
    } else if (event) {
      switch (event) {
        case 'error': stream.destroy(); break
        case 'close': stream.close(); break
        case 'finish': stream.push(null); break // todo: is this needed?
        case 'end': stream.end(); break
        case 'drain': stream.resume(); break
      }
      
    }

    if (streamType & writable) {
      // stream.on('data'  // -> send)
    }
  }
}

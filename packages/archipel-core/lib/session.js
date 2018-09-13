const events = require('events')
const inherits = require('inherits')

function Session (storage, key, opts) {
  if (!(this instanceof Session)) return new Session(storage, key, opts)
  events.EventEmitter.call(this)
}

inherits(Session, events.EventEmitter)

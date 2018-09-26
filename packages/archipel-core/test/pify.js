const { pifyObj } = require('../lib/util')
const tape = require('tape')

function MyObj (key) {
  if (!(this instanceof MyObj)) return new MyObj(key)
  this.key = key
  this.dynamic = function (p, cb) {
    cb(null, p)
  }
}

MyObj.prototype.func = function (p, cb) {
  if (p === 'error') cb(new Error('error'), null)
  else cb(null, p)
}

tape('pifyOjb', async (t) => {
  const obj = MyObj('foo')
  const pif = pifyObj(obj)
  const res = await pif.func('foo')
  t.equal(res, 'foo', 'normal call works')
  try {
    await pif.func('error')
  } catch (e) {
    t.equal(e.message, 'error', 'error works')
  }
  t.end()

})
module.exports = {
  asyncThunky,
  prom,
  isPromise,
  withTimeout
}

/**
 * An async wrapper for thunky
 *
 * Usage:
 * let ready = asyncThunky(_ready)
 *
 * Where _ready receives a callback as single argument
 * which has to be called after being done. Alternatively,
 * _ready can return a promise that is to be awaited.
 *
 * Then, either call ready with a callback
 *    ready(cb)
 * or await it
 *    await ready()
 */
function asyncThunky (fn) {
  const thunk = thunky(done => {
    let ret = fn(done)
    if (isPromise(ret)) {
      ret.then(res => done(null, res)).catch(err => done(err))
    }
  })
  return function (cb) {
    if (cb) thunk(cb)
    else {
      let [promise, done] = prom()
      thunk(done)
      return promise
    }
  }
}

function prom (cb) {
  let done
  const promise = new Promise((resolve, reject) => {
    done = (err, data) => {
      err ? reject(err) : resolve(data)
      if (cb) cb()
    }
  })
  return [promise, done]
}

function isPromise (obj) {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function'
}

let timerResult = Symbol('timer')
async function withTimeout (promise, time) {
  time = time || 1000
  const [timeoutPromise, timeoutDone] = prom()

  const clear = setTimeout(timeoutDone, time, timerResult)

  try {
    let res = await Promise.race([promise, timeoutPromise])
    clearTimeout(clear)
    return res
  } catch (e) { 
    if (e === timerResult) throw new Error('Timeout')
    else throw e 
  }
}


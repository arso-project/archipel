module.exports = { queue }

function queue () {
  let q = []
  let _taken = false
  let handler = q.push.bind(q)
  let push = msg => handler(msg)
  let length = () => q.length
  let take = fn => {
    if (_taken) throw new Error('Cannot subscribe to a queue twice.')
    _taken = true
    q.forEach(msg => fn(msg))
    handler = msg => setImmediate(() => fn(msg))
  }
  return { push, take, length }
}


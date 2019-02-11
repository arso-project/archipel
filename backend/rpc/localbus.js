const { queue } = require('../util/queue')

module.exports = function localBus (peer1, peer2) {
  let qa = queue()
  let qb = queue()

  let a = {
    postMessage: msg => qb.push(msg),
    onmessage: fn => qa.take(fn)
  }
  let b = {
    postMessage: msg => qa.push(msg),
    onmessage: fn => qb.take(fn)
  }

  let promises = []
  if (peer1 && peer2) {
    promises[0] = peer1.addPeer(a)
    promises[1] = peer2.addPeer(b)
  }

  return Promise.all(promises)
  // return [a, b]
}

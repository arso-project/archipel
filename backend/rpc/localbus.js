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

  if (peer1 && peer2) {
    peer1.addPeer(a)
    peer2.addPeer(b)
  }

  return [a, b]
}

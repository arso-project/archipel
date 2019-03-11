const tape = require('tape')
const { keyPair, discoveryKey } = require('../hyperstack')
const { makeLink, parseLink } = require('../triples.js')

tape('link encoding/decoding', t => {
  const keyPair = keyPair()
  const dkey = discoveryKey(keyPair.publicKey)
  console.log('dkey', dkey)
  let path = 'foo'
  let link = makeLink(dkey, path)
  console.log('link', link)
  let { parsedKey, parsedPath } = link
})

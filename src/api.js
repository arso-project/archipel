// exports apis
var stream = require('stream')
var through = require('through2').obj
var store = require('./hyperstore')

var Store = store()

// var through = (fn) => through2.obj(function (chunk, enc, next) {
//   var push = (newChunk) => {
//     this.push(newChunk)
//     next()
//   }
//   fn(chunk, push)
// })

var archiveList = (cb) => {
  var archives = [{
    drive: '',
    graph: '',
    title: ''
  }]
  cb(archives)
}

var archiveAdd = (drive, graph, cb) => {
}

var archiveCreate = (title, cb) => {
  var archive = null
  cb(null, archive)
}

var fileRead = (key, path, cb) => {

}

var fileWrite = (key, path, data, cb) => {

}

var tripleQuery = (key, query, cb) => {
  // if (key === '*')
  // else
  cb()
}

var tripleWrite = (key, triples, cb) => {

}

var api = {}

api.query = (key, q, cb) => {
  Store.query(key, q).pipe(streamInto(cb))
}

api.foo = (str, cb) => {
  str = str.toUpperCase()
  cb(null, str)
}

var val = {}
for (var k = 0; k < 50; k++) {
  val['x' + k] = 'abc'.repeat(k)
}
api.streaming = (q, cb) => {
  var ws = streamInto(cb)
  for (var i = 0; i <= 10000; i++) {
    ws.write({i: val})
  }
  ws.end()
  // stream delayed file
  // var ws = streamInto(cb)
  // var first = true
  // require('fs').createReadStream('./test').pipe(through(function (chunk, enc, next) {
  //   chunk.toString().split('\n').filter((l) => l).map((l) => this.push(q + ' ' + l))
  //   next()
  // })).pipe(through(function (chunk, enc, next) {
  //   var push = (chunk) => this.push(chunk) && next()
  //   if (first) {
  //     first = false
  //     push(chunk)
  //   } else {
  //     setTimeout(() => push(chunk), 1000)
  //   }
  // })).pipe(ws)

  // let i = 0
  // let interval = setInterval(() => {
  //   if (i === 10) {
  //     ws.end()
  //     clearInterval(interval)
  //   } else {
  //     i++
  //     ws.write(q + ' / ' + i)
  //   }
  // }, 1000)
}

module.exports = api

// module.exports = {
//   // archiveList,
//   // archiveAdd,
//   // archiveCreate,
//   // fileRead,
//   // fileWrite,
//   // tripleQuery,
//   // tripleWrite,
//   foo,
//   streaming
// }

function streamInto (cb) {
  var ws = new stream.Writable({objectMode: true})
  ws._write = function (chunk, enc, next) {
    cb(null, chunk)
    next()
  }
  ws.on('finish', () => cb(null, null))
  ws.on('error', (err) => cb(err))
  return ws
}

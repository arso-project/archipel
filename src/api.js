// exports apis
const stream = require('stream')

const archiveList = (cb) => {
  const archives = [{
    drive: '',
    graph: '',
    title: ''
  }]
  cb(archives)
}

const archiveAdd = (drive, graph, cb) => {
}

const archiveCreate = (title, cb) => {
  const archive = null
  cb(null, archive)
}

const fileRead = (key, path, cb) => {

}

const fileWrite = (key, path, data, cb) => {

}

const tripleQuery = (key, query, cb) => {
  // if (key === '*')
  // else
  cb()
}

const tripleWrite = (key, triples, cb) => {

}

const foo = (str, cb) => {
  str = str.toUpperCase()
  cb(null, str)
}

const streaming = (q, cb) => {
  const ws = new stream.Writable({objectMode: true})
  ws._write = function (chunk, enc, next) {
    cb(null, chunk)
    next()
  }
  ws.on('finish', () => cb(null, null))

  let i = 0
  let interval = setInterval(() => {
    if (i === 10) {
      ws.end()
      clearInterval(interval)
    } else {
      i++
      ws.write(q + ' / ' + i)
    }
  }, 1000)
}

module.exports = {
  // archiveList,
  // archiveAdd,
  // archiveCreate,
  // fileRead,
  // fileWrite,
  // tripleQuery,
  // tripleWrite,
  foo,
  streaming
}

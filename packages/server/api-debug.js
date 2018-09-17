var stream = require('stream')
var fs = require('fs')
var path = require('path')

function foo (str, cb) {
  str = str.toUpperCase()
  cb(null, str)
}

function perftestBin (cb) {
  cb(null, fs.createReadStream(path.join(__dirname, '..', '100M.bin')))
}

function perftest (id, cb) {
  console.log(`perftest ${id}: start`)
  var s = new stream.Readable({objectMode: true, read () {}})
  _fillFeed(id, s)
  cb(null, s)

  function _fillFeed (id, s) {
    var val = {}
    for (var k = 0; k < 10; k++) {
      val['x' + k] = 'abc'.repeat(k)
    }
    var i = 0
    var max
    if (id === 1) max = 1000
    if (id === 2) max = 100
    if (id === 3) max = 100000

    worker()

    function worker () {
      if (i === max) {
        s.emit('end')
        console.log(`perftest ${id}: end`)
      } else {
        i++
        var testval
        if (id === 1) {
          testval = []
          for (var j = 0; j < 10; j++) {
            testval[j] = val
          }
          s.push(testval)
        } else if (id === 2) {
          testval = []
          for (var k = 0; k < 100; k++) {
            testval[k] = val
          }
          s.push(testval)
        } else if (id === 3) {
          s.push(i)
        }
        setImmediate(worker)
        // if (i % 1000 === 0) console.log(`perftest ${id}: push ${i}`)
      }
    }
  }
}

module.exports = {
  foo,
  perftest,
  perftestBin
}

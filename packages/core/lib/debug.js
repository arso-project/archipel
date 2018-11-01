module.exports = {
  logRootMode,
  hyperDebug,
  checkRootStat
}

function logRootMode (db) {
  return new Promise((resolve, reject) => {
    let path = '/'
    db.get(path, { prefix: true }, function (err, node) {
      console.log('GET /')
      if (err) console.log('ERR', err)
      console.log(node.value ? node.value.mode : 'INVALID')
      console.log(node)
      resolve()
    })
  })
}

function hyperDebug (db) {
  console.log('DEBUG DATABASE:')
  console.log('KEY    : %s', db.key.toString('hex'))
  console.log('FEEDS:')
  db.feeds.forEach(feed => {
    console.log('  KEY:      ', feed.key.toString('hex'))
    console.log('  LENGTH:   ', feed.length)
    console.log('  WRITABLE: ', feed.writable)
    console.log()
    console.log()
  })

  // console.log('NODES:')
  // let rs = db.createReadStream('/', { prefix: true })
  // let i = 0
  // rs.on('data', (data) => {
  //   console.log('Block ' + i, data)
  //   i++
  // })
  // rs.on('end', () => 'End.')

  console.log('GET /')

  let path = '/'
  db.get(path, { prefix: true }, function (err, node) {
    console.log('  ERR  ', err)
    console.log('  NODE ', node)
  })
}

function checkRootStat (drive, msg) {
  let db = drive.db
  let path = '/'
  db.get(path, { prefix: true }, function (err, node) {
    console.log(msg + ' GET /')
    console.log('=== ERR')
    console.log(err)
    console.log('=== NODE')
    console.log(node)
    console.log()
    console.log()
    drive.stat('/', (err, res) => {
      console.log(msg + ' STAT /')
      console.log('  ERR')
      console.log(err)
      console.log('  RES')
      console.log(res)
      console.log()
      console.log()
    })
  })
}
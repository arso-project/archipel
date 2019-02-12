var speedometer = require('speedometer')

module.exports = function (feeds, opts) {
  opts = opts || {}

  var speed = {}
  var downloadSpeed = speedometer()
  var uploadSpeed = speedometer()
  var timeout = opts.timeout || 1000
  var upTimeout = null
  var downTimeout = null
  var totalTransfer = {
    up: 0,
    down: 0
  }
  var trackedFeeds = {}

  feeds.forEach(checkFeed)

  function checkFeed (feed) {
    if (!feed || !feed.key) return
    var key = feed.key.toString('hex')
    if (!trackedFeeds[key]) {
      trackFeed(feed)
      trackedFeeds[key] = true
    }
  }

  Object.defineProperty(speed, 'downloadSpeed', {
    enumerable: true,
    get: function () { return downloadSpeed() }
  })

  Object.defineProperty(speed, 'uploadSpeed', {
    enumerable: true,
    get: function () { return uploadSpeed() }
  })

  Object.defineProperty(speed, 'downloadTotal', {
    enumerable: true,
    get: function () { return totalTransfer.down }
  })

  Object.defineProperty(speed, 'uploadTotal', {
    enumerable: true,
    get: function () { return totalTransfer.up }
  })

  return speed

  function trackFeed (feed) {
    feed.on('download', function (block, data) {
      totalTransfer.down += data.length
      ondownload(data.length)
    })

    feed.on('upload', function (block, data) {
      totalTransfer.up += data.length
      onupload(data.length)
    })
  }

  // Zero out for uploads & disconnections
  function downZero () {
    downloadSpeed = speedometer()
    if (downTimeout) clearTimeout(downTimeout)
  }

  function upZero () {
    uploadSpeed = speedometer()
    if (upTimeout) clearTimeout(upTimeout)
  }

  function ondownload (bytes) {
    downloadSpeed(bytes)
    if (downTimeout) clearTimeout(downTimeout)
    downTimeout = setTimeout(downZero, timeout)
  }

  function onupload (bytes) {
    uploadSpeed(bytes)
    if (upTimeout) clearTimeout(upTimeout)
    upTimeout = setTimeout(upZero, timeout)
  }
}

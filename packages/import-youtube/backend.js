const stream = require('stream')
const ytdl = require('ytdl-core')
const through = require('through2')
const speedometer = require('speedometer')

module.exports = { plugin }

async function plugin (core, opts) {
  core.rpc.reply('import/youtube', async req => {
    let { link, key } = req
    const archive = await req.session.workspace.getArchive(key, 'hyperdrive')
    await archive.ready()
    let statusStream = new stream.Readable({ objectMode: true, read () {} })

    downloadVideo(archive.getInstance, link, statusStream)

    return {
      foo: 'bar',
      stream: statusStream,
      data: 'yeah'
    }
  })
}

async function downloadVideo (drive, link, status) {
  let info = await ytdl.getInfo(link)
  let id = info.video_id

  let basePath = ['import', 'youtube']
  let filename = id + '.webm'
  let path = [...basePath, filename].join('/')
  let derivedPath = [...basePath, '.derived', filename, 'meta.json'].join('/')

  await drive.writeFile(derivedPath, JSON.stringify(info))
  let ws = drive.createWriteStream(path)

  let opts = {
    filter: (format) => {
      return format.container === 'webm' && format.encoding === 'VP8'
    }
  }

  let rs
  try {
    rs = ytdl.downloadFromInfo(info, opts)
  } catch (e) {
    status.push({ state: 'error', error: e.getMessage() })
    return
  }

  let name = id
  let size = 0

  status.push({
    name, size, step: 'starting'
  })

  rs.on('videoFormat', format => {
    size = format.clen
    status.push({ size, step: 'downloading' })
  })

  let speed = 0
  let written = 0
  let update = () => {
    status.push({ size, speed, written })
  }

  let debounce = setInterval(update, 500)
  const speedo = speedometer()
  const passthrough = through((chunk, enc, next) => {
    written += chunk.length
    speed = speedo(chunk.length)
    next()
  })

  ws.on('finish', () => {
    clearInterval(debounce)
    status.push({
      step: 'finish'
    })
  })

  rs.pipe(passthrough)
  rs.pipe(ws)
}

function derived (base, name) {
  return [base, '.derived', name].join('/')
}

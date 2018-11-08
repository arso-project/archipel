const p = require('path')
const archipelHyperdrive = require('./hyperdrive')
const mime = require('mime-types')
let Stat = require('hyperdrive/lib/stat')

module.exports = {
  name: 'Archipel Hyperdrive',
  plugin: fsPlugin
}

async function fsPlugin (core, opts) {
  core.registerArchiveType({
    hyperdrive: {
      constructor: archipelHyperdrive
    }
  })

  core.rpc.reply('fs/stat', async (req) => {
    maybeWatch(req)
    const { key, path } = req
    const fs = await getHyperdrive(req)
    let stat
    try {
      stat = await fs.stat(path)
    } catch (e) {
      console.log('STAT ERROR', e)
      return []
    }
    const parentStat = cleanStat(stat, path, key)
    const stats = []

    if (stat.isDirectory()) {
      let children = await fs.readdir(path)
      if (children.filter(c => c).length) {
        parentStat.children = children
        const childStats = parentStat.children.map(async name => {
          let childPath = joinPath(path, name)
          let childStat = await fs.stat(childPath)
          return cleanStat(childStat, childPath, key)
        })
        const completed = await Promise.all(childStats)
        completed.forEach(stat => stats.push(stat))
      } else {
        parentStat.children = []
      }
    }

    stats.unshift(parentStat)

    return { stats }

  })

  core.rpc.reply('fs/mkdir', async (req) => {
    const fs = await getHyperdrive(req)
    const res = await fs.mkdir(req.path)
    return res
  })

  core.rpc.reply('fs/readFile', async (req) => {
    const fs = await getHyperdrive(req)
    const res = await fs.readFile(req.path)
    // const str = res.toString()
    return { content: res }
  })

  core.rpc.reply('fs/readFileStream', async (req) => {
    const fs = await getHyperdrive(req)
    const rs = fs.createReadStream(req.path)
    return {
      stream: rs
    }
  })

  core.rpc.reply('fs/history', async (req) => {
    const fs = await getHyperdrive(req)
    const { key, path } = req
    let res = await fs.history(req.path)
    res = res.map(nodes => {
      let node = nodes[0]
      let stat = cleanStat(Stat(node.value), path, key)
      stat.seq = node.seq
      stat.feed = node.feed
      return stat
    })
    return { history: res }
  })

  core.rpc.reply('fs/writeFile', async (req) => {
    const fs = await getHyperdrive(req)
    return fs.asyncWriteStream(req.path, req.stream)
  })

  let watchlist = []
  async function maybeWatch (req) {
    const { key } = req
    if (watchlist.indexOf(key) > -1) return
    watchlist.push(key)
    const archive = await req.session.workspace.getArchive(key, 'hyperdrive')
    archive.getInstance().on('change', () => {
      core.rpc.request('fs/clearStats', { archive: key })
    })
  }
}

async function getHyperdrive (req) {
  if (!req.session.workspace) throw new Error('No workspace.')
  let { key } = req
  const archive = await req.session.workspace.getArchive(key, 'hyperdrive')
  await archive.ready()
  return archive.getInstance()
}

function joinPath (prefix, suffix) {
  if (prefix.slice(-1) === '/') prefix = prefix.substring(0, prefix.length - 1)
  if (suffix[0] === '/') suffix = suffix.substring(1)
  return prefix + '/' + suffix
}

function cleanStat (stat, path, key) {
  return {
    key,
    path,
    name: p.parse(path).base,
    isDirectory: stat.isDirectory(),
    size: stat.size,
    mtime: stat.mtime,
    ctime: stat.ctime,
    mimetype: stat.isDirectory() ? 'archipel/directory' : mime.lookup(path),
    children: undefined
  }
}

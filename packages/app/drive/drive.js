module.exports = {
  name: 'drive',
  plugin: driveBackend,
  dependencies: [
    'workspace'
  ]
}

async function driveBackend (core, opts) {
  core.registerMountType('fs', async (storage, key, opts) => {
    const fs = Fs(storage, key, opts)
    return fs
    // return { proxy: fs, db: fs.hyperdrive.db }
  })

  core.take('fs/stat', async (req) => {
    let { key, path } = split(req.data)
    const archive = req.workspace.getMount('fs', key)
    const dirs = archive.fs.readDir(path)
    return dirs
  })

  core.take('fs/fileContent', async (req) => {
    let { key, path } = split(req.data)
    const archive = req.workspace.getArchive(key)
    const fileContent = await archive.fs.readFile(path)
    return { buffer: fileContent }
  })

  core.take('fs/createDir', async (req, reply) => {
    let { key, path } = split(req.data)
    const archive = req.workspace.getArchive(key)
    const dirs = await archive.fs.mkdir(path)
    reply.attach('fs/listDir', req)
    return { dirs }
  })

  core.take('fs/writeFile', async (req) => {
    let { key, path } = split(req.id)
    const archive = req.workspace.getArchive(key)
    const res = archive.writeFile(path, req.stream)
    return res
  })

  return true
}

function split (id) {
  const { key, ...path } = id.split(':')
  return { key, path: path.join(':') }
}

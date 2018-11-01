module.exports = Persist

function Persist (library, type, key, opts) {
  if (!(this instanceof Persist)) return new Persist(library, type, key, opts)
  const self = this

  this.key = key
  this.library = library
  this.store = opts.store || library.makeInstance(type, key, opts)

  library.on('archive', archive => {
    archive.on('set:state', () => self.saveArchive(archive))
  })
}

Persist.prototype._saveArchive = async function (archive) {
  const mountInfo = {
    prefix: archive.key,
    type: archive.type,
    key: archive.key,
    status: archive.getState()
  }
  await this.store.addMount(mountInfo)
}

Persist.prototype.open = async function () {
  let self = this
  let mounts = await this.store.getMounts()
  let promises = mounts.map(async mount => {
    const { type, key, opts } = mount
    await self.library.addArchive(type, key, opts)
  })
  await Promise.all(promises)
}

import storeConstructor from './store'
import ArchiveInfo from './ArchiveInfo'
import ArchiveSharing from './ArchiveSharing'

export default {
  plugin: archivePlugin
}

async function archivePlugin (core, opts) {
  core.components.add('archiveTabs', ArchiveInfo, { title: 'Info' })
  core.components.add('archiveTabs', ArchiveSharing, { title: 'Sharing' })

  let store = core.makeStore('archive', storeConstructor)

  let updateStream = await core.api.hyperlib.createUpdateStream()
  updateStream.on('data', data => {
    let key = data.key
    store.set(draft => {
      draft.archives[key] = data
    })
  })
}

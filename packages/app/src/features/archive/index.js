import storeConstructor from './store'
import ArchiveInfo from './ArchiveInfo'
import ArchiveSharing from './ArchiveSharing'

import registry from '../../lib/component-registry.js'
import { getApi } from '../../lib/api'

export default {
  plugin: archivePlugin
}

registry.add('archiveTabs', ArchiveInfo, { title: 'Info' })
registry.add('archiveTabs', ArchiveSharing, { title: 'Sharing' })

// getApi().then(ready)
// async function ready (api) {
  // let archiveStream = await api.hyperlib.createArchiveStream(true)
  // archiveStream.on('data', archive => {
    // // console.log('got archive', archive)
  // })
// }

async function archivePlugin (core, opts) {
  let store = core.makeStore('archive', storeConstructor)

  let updateStream = await core.api.hyperlib.createArchiveStream()
  updateStream.on('data', data => {
    let key = data.key
    store.set(draft => {
      draft.archives[key] = data
    })
  })
  let statsStream = await core.api.hyperlib.createStatsStream()
  statsStream.on('data', data => {
    // do something with stats data.
  })
}

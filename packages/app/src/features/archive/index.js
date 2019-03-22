import { init as initArchiveStore } from './archive'
import { init as initNetstatsStore } from './netStatsStore.js'

export default function start () {
  initArchiveStore()
  initNetstatsStore()
}

export { default as ListArchives } from './ListArchives'

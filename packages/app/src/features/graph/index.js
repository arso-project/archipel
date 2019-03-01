import { TagSidebar, TagOverview, TagPage } from './Tag'

import { registerElement, registerRoute } from '../../lib/router.js'
import registry from '../../lib/component-registry'

registry.add('fileSidebar', TagSidebar, { title: 'Metadata' })

registerRoute('archive/:archive/tags', TagOverview)
registerRoute('archive/:archive/tags/:tag', TagPage)

registerElement('archive/:archive', {
  link: { name: 'Tags', href: 'archive/:archive/tags', weight: 10 }
})

// todo: remove.
export default {
  name: 'graph-frontend',
  plugin
}
async function plugin (core) {}

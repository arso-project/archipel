import Tag, { TagOverview } from './Tag'

import { registerElement, registerRoute } from '../../lib/router.js'
import registry from '../../lib/component-registry'

registry.add('fileSidebar', Tag, { title: 'Tags' })

registerRoute('archive/:archive/tags', TagOverview, { wrap: true })

registerElement('archive/:archive', {
  link: { name: 'Tags', href: 'archive/:archive/tags', weight: 10 }
})

// todo: remove.
export default {
  name: 'graph-frontend',
  plugin
}
async function plugin (core) {}

export default componentRegistry

async function componentRegistry (core) {
  let components = {}
  const componentPlugin = {
    add: (type, component, opts, match) => {
      components[type] = components[type] || []
      components[type].push({ component, opts, match })
    },
    getAll: (type) => {
      let list = components[type]
      if (!list) return null
      return list
      // return list.map(item => item.component)
    }
  }
  core.decorate('components', componentPlugin)
}

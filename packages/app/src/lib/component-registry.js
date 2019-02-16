class Registry {
  constructor () {
    this.map = {}
  }

  add (type, component, opts, match) {
    if (!match) match = opts
    this.map[type] = this.map[type] || []
    this.map[type].push({ component, opts, match })
  }

  getAll (type) {
    let list = this.map[type]
    if (!list) return null
    return list
  }

  match (name, props) {
    if (!this.map[name] || !this.map[name].length) return null
    for (let i = 0; i < this.map[name].length; i++) {
      let el = this.map[name][i]
      if (el.match && el.match(props, el.opts)) return el
    }
    return null
  }
}

export const components = new Registry()

export const __components = {
  add: (type, component, opts, match) => {
    _components[type] = _components[type] || []
    _components[type].push({ component, opts, match })
  },
  getAll: (type) => {
    let list = _components[type]
    if (!list) return null
    return list
    // return list.map(item => item.component)
  }
}


export async function ucorePlugin (core) {
  core.decorate('components', components)
}


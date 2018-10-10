class App {
  constructor () {
    this.plugins = []
  }

  use (plugin) {
    this.plugins.push(plugin)
    return this
  }

  getAll (key) {
    return this.plugins.filter(plugin => plugin[key]).map(plugin => plugin[key]).reduce((ret, item) => {
      if (Array.isArray(item)) ret = ret.concat(item)
      else ret.push(item)
      return ret
    }, [])
  }
}

export default App

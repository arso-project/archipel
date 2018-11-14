
module.exports = ArchipelApp

const plugin = {
  mountTypes: () => {}
  // fsExtract: (file, graph, next) =>
}

function ArchipelApp (opts) {
  if (!(this instanceof ArchipelApp)) return new ArchipelApp(opts)

  this.plugins = []
  this.pluginErrors = []
  this._pluginPromises = 0
}

ArchipelApp.prototype.use = function (pluginConstr, opts) {
  const pluginPromise = pluginConstr(opts)
  this._pluginPromises.push(pluginPromise)
  pluginPromise
    .then(plugin => this.plugins.push(plugin))
    .catch(e => this.pluginErrors.push(e))
}

ArchipelApp.prototype.ready = async function () {
  try {
    await Promise.all(this._pluginPromises)
    return null
  } catch (e) {
    return e
  }
}

ArchipelApp.prototype.getMountTypes = function () {
  return this.plugins.filter(plugin => plugin.mountTypes).map(plugin => plugin.mountTypes)
}

ArchipelApp.prototype.getProcessors = function (stage) {
  return this.plugins.filter(plugin => plugin.processor && plugin.processor[stage]).map(plugin => plugin.processor[stage])
}

const pipeline = ['extract', 'graph', 'finish']
const object = {
  file: null,
  graph: null,
  messages: null
}

ArchipelApp.prototype.runPipeline = async function (pipeline, object) {
  pipeline.forEach(async stage => {
    object = await runStage(stage, object)
  })

  return object

  function runStage (stage, object) {
    return new Promise((resolve, reject) => {
      const funcs = this.getProcessors(stage)
      next(object)
      function next (result) {
        const func = funcs.shift()
        if (func) func(result, next)
        else resolve(result)
      }
    })
  }

}

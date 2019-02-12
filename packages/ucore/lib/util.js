module.exports = {
  makeDecorate
}

const META = Symbol('ucore-meta')

function makeDecorate (instance, domain = '_noname_') {
 return function (name, value, meta = 'decorate') {
    if (instance.hasOwnProperty(name)) {
      throw new Error(
        `Cannot decorate ${domain} with ${name} (from ${meta}): ` +
        `Already taken (by ${instance[name][META]}).`
      )
    }
    value[META] = meta
    Object.defineProperty(instance, name, { value, enumerable: true })
  }
}

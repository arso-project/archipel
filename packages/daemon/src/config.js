const p = require('path')
module.exports = getConfig

function getConfig () {
  return {
    dbPath: p.resolve(p.join(__dirname, '../../..', '.db')),
    port: 8080,
    // staticPath: process.env.ARCHIPEL_STATIC_PATH
    staticPath: p.resolve(p.join(__dirname, '../../..', 'packages/app/dist/web'))
  }
}

// const p = require('path')
// const parents = require('parents')
// const fs = require('fs')
// const minimist = require('minimist')

// const argvKeys = [
//   'dbpath'
// ]

// function getConfigPath () {
//   const names = ['archipel.json']
//   if (process.env.NODE_ENV === 'development') names.unshift('archipel.development.json')
//   const dirs = parents(require.main)
//   let found = null
//   dirs.forEach((dir) => {
//     names.forEach(name => {
//       if (!found && fs.existsSync(p.join(dir, name))) found = p.join(dir, name)
//     })
//   })
//   return found
// }

// function getConfig () {
//   let config = {}
//   const cpath = getConfigPath()
//   if (cpath) config = JSON.parse(fs.readFileSync(cpath))

//   const argv = minimist(process.argv.slice(2));
//   Object.keys(argv).filter(key => argvKeys.indexOf(key) !== -1).map(key => {
//     let configSel = key.split('.').reduce((config, name) => {
//       if (!config[name]) config[name] = {}
//       return config[name]
//     })
//     configSel = argv[key]
//   })

//   return config
// }

// module.exports = getConfig

const p = require('path')
const ucore = require('ucore')

const server = require('./features/http-server')
const rpc = require('ucore/rpc/server')
const workspace = require('./features/workspace')
const drive = require('./features/hyperdrive')
const graph = require('@archipel/graph/backend')

const Rootspace = require('./lib/rootspace')

module.exports = boot

async function boot (opts) {
  opts = opts || {}

  const core = ucore()

  core.use(config, opts)
  core.after(setupServer)
  await core.ready()

  let httpPort = core.config('httpPort')
  if (httpPort) {
    core.httpServer.listen(httpPort, console.log(`Server listening on port ${httpPort}`))
  }

  return core

  function setupServer () {
    if (core.config('httpPort')) {
      core.register(server, { staticPath: core.config('staticPath') })
    }
    core.register(rpc, core.config('rpc'))
    core.use(archipel, { dbPath: core.config('dbPath') })
    core.use(workspace)
    core.register(drive)
    core.register(graph)
  }
}

async function config (core, opts) {
  const defaultConfig = {
    noHttp: false,
    httpPort: 8080,
    dbPath: p.join(__dirname, '../..', '.db'),
    cliConfig: true,
    staticPath: process.env.ARCHIPEL_STATIC_PATH || p.join(__dirname, '../app/dist/web'),
    rpc: {
      prefix: '/ucore'
    }
  }

  let config = Object.assign({}, defaultConfig, opts)

  if (config.cliConfig) {
    config = Object.assign({}, config, getCliConfig())
  }

  core.decorate('config', (key) => {
    return key ? config[key] : config
  })
}

async function archipel (core, opts) {
  let archiveTypes
  core.decorate('registerArchiveType', (newTypes) => {
    archiveTypes = { ...archiveTypes, ...newTypes }
  })
  core.decorate('getArchiveTypes', () => archiveTypes)

  core.decorate('root', Rootspace(opts.dbPath))
  core.ready(() => {
    core.root.registerArchiveTypes(archiveTypes)
  })
}

function getCliConfig () {
  console.log(process.cwd())
  let args = {}
  process.argv.slice(2).forEach(function (val, index, array) {
    let arg = val.split(/[=:]/)
    Object.assign(args, JSON.parse(`{ "${arg[0]}":"${arg[1]}"}`))
  })
  let { port, dbpath, ...rest } = args

  dbpath = dbpath || process.env.ARCHIPEL_DB_PATH
  port = port || process.env.ARCHIPEL_HTTP_PORT

  let config = {}
  if (port) config.httpPort = Number(port)
  // Todo: Too much magic with going two dirs up.
  if (dbpath) config.dbPath = p.join(process.cwd(), '../..', dbpath)
  return config
}

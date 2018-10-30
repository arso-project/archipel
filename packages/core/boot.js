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
  // read out process.argv to get start parameters:
  let args = {}
  process.argv.slice(2).forEach(function (val, index, array) {
    // console.log(index + ': ' + val)
    let arg = val.split(/[=:]/)
    Object.assign(args, JSON.parse(`{ "${arg[0]}":"${arg[1]}"}`))
  })
  let { port, dbpath, ...rest } = args
  port = Number(port) || 8080
  dbpath = dbpath || '.db'
  process.env.ARCHIPEL_DB_PATH = p.join(__dirname, '../..', dbpath)

  // actual programm code:
  opts = opts || {}
  const core = ucore()
  if (!opts.noHttp) core.register(server, { staticPath: process.env.ARCHIPEL_STATIC_PATH })

  let rpcOpts = { prefix: '/ucore' }
  if (opts.rpc) rpcOpts = { ...rpcOpts, ...opts.rpc }
  core.register(rpc, rpcOpts)

  core.use(archipel)
  core.use(workspace)
  core.register(drive)
  core.register(graph)

  await core.ready()
  if (!opts.noHttp) core.httpServer.listen(port, console.log(`Server listening on port ${port}`))

  return core
}

async function archipel (core, opts) {
  let dbPath = process.env.ARCHIPEL_DB_PATH || p.join(__dirname, '../..', '.db')
  dbPath = p.resolve(dbPath)

  let archiveTypes
  core.decorate('registerArchiveType', (newTypes) => {
    archiveTypes = {...archiveTypes, ...newTypes}
  })
  core.decorate('getArchiveTypes', () => archiveTypes)

  core.decorate('root', Rootspace(dbPath))
  core.ready(() => {
    core.root.registerArchiveTypes(archiveTypes)
  })
}

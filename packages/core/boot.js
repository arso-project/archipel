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
  if (!opts.noHttp) core.register(server, { staticPath: process.env.ARCHIPEL_STATIC_PATH })

  let rpcOpts = { prefix: '/ucore' }
  if (opts.rpc) rpcOpts = { ...rpcOpts, ...opts.rpc }
  core.register(rpc, rpcOpts)

  core.use(archipel)
  core.use(workspace)
  core.register(drive)
  core.register(graph)

  await core.ready()
  if (!opts.noHttp) core.httpServer.listen(8080, console.log('Server listening on port 8080'))

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

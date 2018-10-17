const p = require('path')
const ucore = require('ucore')

const server = require('./features/http-server')
const rpc = require('ucore/rpc/server')
const workspace = require('./features/workspace')
const fs = require('./features/fs')

const Rootspace = require('./lib/rootspace')

module.exports = boot

async function boot (opts) {
  const core = ucore()
  if (!opts.noHttp) core.register(server, { staticPath: process.env.ARCHIPEL_STATIC_PATH })

  let rpcOpts = { prefix: '/ucore' }
  if (opts.rpc) rpcOpts = { ...rpcOpts, ...opts.rpc }
  core.register(rpc, rpcOpts)

  core.use(archipel)
  core.use(workspace)
  core.register(fs)
  await core.ready()
  if (!opts.noHttp) core.httpServer.listen(8080, console.log('Server listening on port 8080'))

  return core
}

async function archipel (app, opts) {
  const dbPath = process.env.ARCHIPEL_DB_BATH || p.resolve(p.join(__dirname, '../..', '.db'))
  app.decorate('root', Rootspace(dbPath))
}

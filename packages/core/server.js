const p = require('path')
const ucore = require('ucore')

const server = require('./features/http-server')
const rpc = require('ucore/rpc/server')
const workspace = require('./features/workspace')
const fs = require('./features/fs')

const Rootspace = require('./lib/rootspace')

const core = ucore()

boot(core)

async function boot (app) {
  app.register(server, { staticPath: process.env.ARCHIPEL_STATIC_PATH })
  app.register(rpc, { prefix: '/ucore' })
  app.use(archipel)
  app.use(workspace)
  app.register(fs)
  await app.ready()
  app.httpServer.listen(8080, console.log('Server listening on port 8080'))
}

async function archipel (app, opts) {
  const dbPath = process.env.ARCHIPEL_DB_BATH || p.resolve(p.join(__dirname, '../..', '.db'))
  app.decorate('root', Rootspace(dbPath))
}

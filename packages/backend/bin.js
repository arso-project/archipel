const server = require('./server')
const config = require('./config')
const minimist = require('minimist')

const argv = minimist(process.argv.slice(2))

if (argv.port) config.server.port = argv.port
if (argv.host) config.server.host = argv.host
if (argv.dbpath) config.library.path = argv.dbpath

const extensions = require('../../extensions')

config.extensions = extensions

if (process.env.NODE_ENV === 'development') {
  process.on('uncaughtException', (err) => {
    console.error('Caught exception: ' + err)
  })

  process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled rejection: ', reason, p)
  })
}

// Start server.
server(config)

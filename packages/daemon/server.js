const daemon = require('.')

const Daemon = daemon()
Daemon.on('ready', (e) => console.log('Daemon is listening on %s:%s', Daemon.server.host, Daemon.server.port))
Daemon.on('error', (e) => console.log(e))

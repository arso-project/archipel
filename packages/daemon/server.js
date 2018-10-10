const Daemon = require('.')

const daemon = Daemon()
daemon.on('ready', (e) => ready(daemon))
daemon.on('error', (e) => console.log(e))
daemon.listen()

function ready (daemon) {
  console.log('Daemon is listening on %s:%s', daemon.server.address().address, daemon.server.address().port)
  // daemon.root.deleteWorkspace('a387944b5b1ce16c64c1c14f85606cbeabb0fcc1f5b26d0ddc7716e6317c27c7')
  //   .then(res => console.log('DELETE WS', res))
}

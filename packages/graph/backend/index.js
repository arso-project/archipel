const ArchipelHypergraph = require('./hypergraph')

module.exports = { plugin }

async function plugin (core, opts) {
  core.registerArchiveType({
    hypergraph: {
      constructor: ArchipelHypergraph
    }
  })

  core.on('workspace/createArchive', async ({ workspace, archive }) => {
    if (!(archive.isPrimary() && archive.getState().authorized && archive.type === 'hyperdrive')) return
    const mount = await archive.makePersistentMount('hypergraph', 'graph')
    const graph = mount.getInstance()
    const key = mount.key
    await graph.put({ subject: key, predicate: 'archipel://parent', object: archive.key })
  })

  core.rpc.reply('graph/test', async (req) => {
    const archive = await req.session.workspace.getArchive(req.key)
    let graph = await archive.getMountInstance('graph')
    if (!graph) return { data: null }
    const res = await graph.get({ predicate: 'archipel://parent' })
    return { data: res }
  })

  // core.rpc.reply('graph/get', async req => {
  //   const { query } = req
  //   const triples = await graph.get(query)
  //   return { triples }
  // })
  // core.rpc.reply('graph/getStream', async req => {
  //   const { query } = req
  //   const queryStream = graph.getStream(query)
  //   const resultStream = makeBuffered(500)
  //   queryStream.pipe(resultStream)
  //   return { stream: resultStream }
  // })
}

// const through2 = require('through2')
// const makeBuffered = (limit) => {
//   let buf = []
//   return through2.obj(function (chunk, enc, next) {
//     buf.push(chunk)
//     if (buf.length > limit) {
//       this.push(buf)
//       buf = []
//     }
//     next()
//   })
// }

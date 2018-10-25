module.exports = workspace

const { hex } = require('../lib/util')

async function workspace (core, opts) {
  let mountTypes = []

  core.rpc.reply('workspace/list', async (req, reply) => {
    const data = await core.root.getWorkspaces()
    return { data }
  })

  core.rpc.reply('workspace/open', async (req) => {
    const workspace = await core.root.getWorkspace(req.key)
    if (!workspace) throw new Error('Workspace not found.')
    await workspace.ready()
    req.session.workspace = workspace
    return { data: { key: hex(workspace.key) } }
  })

  core.rpc.reply('workspace/create', async req => {
    try {
      const info = req.info
      const workspace = await core.root.createWorkspace(info)
      await workspace.ready()
      return { data: workspace.info }
    } catch (e) {
      console.log('WORKSPACE CREATE', e)
    }
  })

  core.rpc.reply('workspace/listArchives', async (req) => {
    if (!req.session.workspace) throw new Error('No workspace.')
    const archives = await req.session.workspace.listArchives()
    let proms = archives.map(async archive => {
      let info = await archive.archive.getInfo()
      info.status = archive.status
      return info
    })
    let data = await Promise.all(proms)
    return { data }
  })

  core.rpc.reply('workspace/createArchive', async (req) => {
    if (!req.session.workspace) throw new Error('No workspace.')
    const archive = await req.session.workspace.createArchive('hyperdrive', req.info)
    await archive.ready()
    let info = await archive.getInfo()
    return { data: info }
  })

  core.rpc.reply('workspace/shareArchive', async (req) => {
    if (!req.session.workspace) throw new Error('No workspace.')
    const res = await req.session.workspace.shareArchive(req.key, req.share)
    return res
  })

  core.rpc.reply('workspace/addRemoteArchive', async (req) => {
    if (!req.session.workspace) throw new Error('No workspace.')
    let { key, title } = req
    let opts = { info: { title: title } }
    const res = await req.session.workspace.addRemoteArchive(key, opts)
    return res
  })
}

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
    const data = await req.session.workspace.getPrimaryArchivesWithInfo()
    return { data }
  })

  core.rpc.reply('workspace/createArchive', async (req) => {
    if (!req.session.workspace) throw new Error('No workspace.')
    let workspace = req.session.workspace
    const archive = await workspace.createArchive('hyperdrive', req.info)
    await archive.instance.ready()
    let info = await archive.instance.getInfo()
    core.emit('workspace/createArchive', { workspace, archive })
    return { data: info }
  })

  core.rpc.reply('workspace/shareArchive', async (req) => {
    if (!req.session.workspace) throw new Error('No workspace.')
    await req.session.workspace.setShare(req.key, req.share)
    let res = await req.session.workspace.getStatusAndInfo(req.key)
    return { data: res }
  })

  core.rpc.reply('workspace/addRemoteArchive', async (req) => {
    if (!req.session.workspace) throw new Error('No workspace.')
    let { key } = req
    await req.session.workspace.addRemoteArchive('hyperdrive', key)
    let res = await req.session.workspace.getStatusAndInfo(key)
    return res
  })
}

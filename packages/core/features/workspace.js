module.exports = workspace

const { hex } = require('../lib/util')
const { hyperDebug } = require('../lib/debug')

async function workspace (core, opts) {
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
      return { data: { info: workspace.info, key: hex(workspace.key) } }
    } catch (e) {
      console.log('WORKSPACE CREATE', e)
    }
  })

  core.rpc.reply('workspace/listArchives', async (req) => {
    if (!req.session.workspace) throw new Error('No workspace.')
    const archives = await req.session.workspace.getPrimaryArchivesWithInfo()
    const data = archives.reduce((data, archive) => Object.assign(data, { [archive.key]: archive }), {})
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

  core.rpc.reply('workspace/authorizeWriter', async (req) => {
    if (!req.session.workspace) throw new Error('No workspace.')
    const { key, writerKey } = req
    const archive = await req.session.workspace.getArchive(key, 'hyperdrive')
    let res = await archive.authorizeWriter(writerKey)
    return { data: res }
  })

  core.rpc.reply('workspace/addRemoteArchive', async (req) => {
    if (!req.session.workspace) throw new Error('No workspace.')
    let { key } = req
    await req.session.workspace.addRemoteArchive('hyperdrive', key)
    let res = await req.session.workspace.getStatusAndInfo(key)
    return res
  })

  core.rpc.reply('debug', async (req) => {
    if (!req.session.workspace) throw new Error('No workspace.')
    let { key } = req
    const archive = await req.session.workspace.getArchive(key, 'hyperdrive')
    const instance = archive.getInstance()
    const db = instance.db
    hyperDebug(db)
  })
}

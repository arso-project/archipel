module.exports = workspace

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
    return { data: workspace.info }
  })

  core.rpc.reply('workspace/create', async req => {
    const info = req.info
    const workspace = await core.root.createWorkspace(info)
    await workspace.ready()
    return { data: workspace.info }
  })

  core.rpc.reply('workspace/listArchives', async (req) => {
    if (!req.session.workspace) throw new Error('No workspace.')
    const archives = await req.session.workspace.getArchives()
    return { data: archives }
  })

  core.rpc.reply('workspace/createArchive', async (req) => {
    if (!req.session.workspace) throw new Error('No workspace.')
    const archive = await req.session.workspace.createArchive(req.info)
    await archive.ready()
    return { data: archive.info }
  })

  core.rpc.reply('workspace/shareArchive', async (req) => {
    if (!req.session.workspace) throw new Error('No workspace.')
    const res = await req.session.workspace.shareArchive(req.key)
    return res
  })

  core.rpc.reply('workspace/loadRemoteArchives', async (req) => {
    if (!req.session.workspace) throw new Error('No workspace.')
    const remoteArchives = await req.session.workspace.loadRemoteArchives()
    return { data: remoteArchives }
  })
}

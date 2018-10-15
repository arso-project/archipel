module.exports = workspace

async function workspace (app, opts) {
  app.rpc.reply('workspace/list', async (req, reply) => {
    const data = await app.root.getWorkspaces()
    return { data }
  })

  app.rpc.reply('workspace/open', async (req) => {
    const workspace = await app.root.getWorkspace(req.key)
    if (!workspace) throw new Error('Workspace not found.')
    await workspace.ready()
    req.session.workspace = workspace
    return { data: workspace.info }
  })

  app.rpc.reply('workspace/create', async req => {
    const info = req.info
    const workspace = await app.root.createWorkspace(info)
    await workspace.ready()
    return { data: workspace.info }
  })

  app.rpc.reply('workspace/listArchives', async (req) => {
    if (!req.session.workspace) throw new Error('No workspace.')
    const archives = await req.session.workspace.getArchives()
    return { data: archives }
  })

  app.rpc.reply('workspace/createArchive', async (req) => {
    if (!req.session.workspace) throw new Error('No workspace.')
    const archive = await workspace.createArchive(req.payload)
    await archive.ready()
    return { data: archive.info }
  })
}

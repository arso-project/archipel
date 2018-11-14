const tape = require('tape')
const ram = require('random-access-memory')

const { Rootspace } = require('..')

tape('basic Rootspace behaviour', async (t) => {
  const WorkspaceManager = Rootspace(ram)
  t.equal(typeof WorkspaceManager, 'object')

  const ws1key = await WorkspaceManager.createWorkspace({ title: 'WS1' })
  // const ws1 = await WorkspaceManager.getWorkspace(ws1key)
  // const workspaces = await WorkspaceManager.getWorkspaces()
  console.log(ws1key)

  t.end()
})

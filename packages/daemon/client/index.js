window.rpc(async api => {
  try {
    const R = await api.rootspace()
    const spaces = await R.getWorkspaces()
    const key = spaces[1].key
    const ws = await R.getWorkspace(key)
	const archives = await ws.getArchives()
	const archive = await ws.archive(archives[0].key)
	console.log(archive)
    const fs = await archive.fs()
	console.log(fs)
	fs.readFile('dat.json', (err, data) => console.log('GOT FILE', err, data))
  } catch (e) { console.log('ERROR', e) }
})



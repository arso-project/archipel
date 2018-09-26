const tape = require('tape')
const ram = require('random-access-memory')

const { Rootspace } = require('..')

tape('basic functions', (t) => {
  const app = Rootspace(ram)
  const space = app.createWorkspace({title: 'Test!'})
  const titles = ['first', 'second']
  titles.forEach((title) => space.createArchive({title}))

  space.on('archive', (archive) => {
    archive.ready(() => {
      archive.fs.readFile('dat.json', (err, file) => {
        t.error(err, 'readFile ok')
        maybeDone(JSON.parse(file.toString()))
      })
    })
  })

  function maybeDone (info) {
    const title = info.title
    const idx = titles.indexOf(title)
    t.notEqual(idx, -1, 'title matches')
    titles.splice(idx, 1)
    if (!titles.length) {
      t.equal(space.archives.length, 2, 'archive count')
      t.end()
    }
  }
})

tape('set and update workspace info', (t) => {
  const app = Rootspace(ram)
  const space = app.createWorkspace({title: 'foo'})
  space.ready(() => {
    space.db.get('info', (err, node) => {
      t.error(err, 'no error')
      t.equal(node.value.title, 'foo', 'title was set')
      space.updateInfo({ hello: 'world' })
      space.on('info.update', (info) => {
        const expected = {title: 'foo', hello: 'world'}
        t.deepEqual(info, expected, 'info correct')
        t.deepEqual(space.info, expected, 'on space correct')
        space.db.get('info', (err, node) => {
          t.error(err, 'no error')
          t.deepEqual(node.value, info, 'also in db')
          t.end()
        })
      })
    })
  })
})

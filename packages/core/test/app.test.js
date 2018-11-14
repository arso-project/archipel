const tape = require('tape')
const ram = require('random-access-memory')

const { ArchipelApp } = require('..')

tape('basic ArchipelApp behaviour', (t) => {
  const app = ArchipelApp(ram)

  const expected = {
    plugins: [],
    pluginErrors: []
  }

  t.deepEqual(app.plugins, expected.plugins)
  t.deepEqual(app.pluginErrors, expected.pluginErrors)
  t.end()
})

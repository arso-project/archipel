const Readable = require('stream').Readable
const freezeDry = require('freeze-dry').default
const ky = require('ky-universal')
const u = require('url')
const p = require('path')
const jsdom = require('jsdom')
const blake2b = require('blake2b')
const htmlToMd = require('./html-to-markdown.js')
// const got = require('got')
//
const debug = require('debug')('import')

const { makeId } = require('../common')

const metascraper = require('metascraper')([
  require('metascraper-author')(),
  require('metascraper-date')(),
  require('metascraper-description')(),
  require('metascraper-image')(),
  require('metascraper-logo')(),
  require('metascraper-clearbit-logo')(),
  require('metascraper-publisher')(),
  require('metascraper-title')(),
  require('metascraper-url')()
])

const readability = require('readability-from-string')

exports.rpc = { importer }

const jobs = {}

function importer (api, opts) {
  return {
    async start (id, url, target) {
      const archive = await resolveTarget(this.session, target)
      const job = new Importer(id, url, archive)
      jobs[job.id] = job
      job.setPipeline([
        download,
        // metascrape,
        readable,
        // freeze,
        saveFiles
      ])
      job.start()
      return job.statusStream
    },

    fullState (id) {
      if (!jobs[id]) throw new Error('Invalid job id.')
      return jobs[id].serialize()
    }
  }

  async function resolveTarget (session, key) {
    if (!session.library) throw new Error('No library open.')
    const library = await api.hyperlib.get(session.library)
    const archive = await library.getArchive(key)
    return archive
  }
}

class Importer {
  constructor (id, url, target) {
    this.id = id || makeId()
    this.url = url
    this.target = target

    this.state = {}

    this.resources = {}
    this.files = {}
    this.derivedFiles = {}

    this.pipeline = []

    this.currentStep = -1

    this.statusStream = new Readable({
      objectMode: true,
      read () {}
    })
  }

  start () {
    const self = this
    this.setState({ status: 'work' }, 'start!')

    this.executeNextStep(finish)

    function finish (error) {
      if (error) this.setState({ status: 'error', error }, 'error!')
      self.setState({ status: 'done' }, 'finished!')
      self.statusStream.push(null)
    }
  }

  executeNextStep (done) {
    this.currentStep++
    if (!this.pipeline[this.currentStep]) {
      return done()
    }
    let worker = this.pipeline[this.currentStep]
    this.log('starting step: ' + worker.name)

    process.nextTick(() => {
      try {
        worker(this, (err) => {
          if (err) return error(err)
          this.executeNextStep(done)
        })
      } catch (err) {
        return error(err)
      }
    })

    function error (err) {
      debug('error', err)
      this.executeNextStep(done)
    }
  }

  setState (newState, message) {
    if (typeof newState === 'function') this.state = newState(this.state)
    else this.state = { ...this.state, ...newState }
    this.statusStream.push({ state: this.state, message })
  }

  getState (cb) {
    if (cb) cb(this.state)
    return this.state
  }

  log (message) {
    debug(message)
    this.statusStream.push({ message })
  }

  error (message, ...args) {
    debug('error', message, ...args)
    this.statusStream.push({ error: { message, args }})
  }

  setPipeline (steps) {
    this.pipeline = steps
  }

  addResource (id, resource) {
    this.resources[id] = resource
  }

  getResource (id) {
    return this.resources[id]
  }

  addFile (path, body) {
    this.files[path] = body
  }

  addDerivedFile (path, body) {
    this.derivedFiles[path] = body
  }

  serialize () {
    return {
      state: this.state,
      files: this.files,
      resources: this.resources
    }
  }
}

function urlToFilename (url, prefix) {
  let parsed = u.parse(url)
  let PREFIX = '_import'
  // todo: how to handle GET params?
  prefix = prefix || ''
  let path = p.join(PREFIX, prefix, parsed.hostname, parsed.pathname)
  return path
}

async function download (job, next) {
  let url = job.url
  // let drive = job.api.hyperdrive

  let response = await ky(url)
  let text = await response.text()

  // drive.writeFile(filepath, text)
  console.log('got response')
  job.addResource('html', text)

  // job.addFile(filepath, text)

  const dom = new jsdom.JSDOM(text)
  job.addResource('dom', dom)
  next()
}

async function freeze (job, next) {
  const dom = job.getResource('dom')

  const html = await freezeDry(dom.window.document, {
    docUrl: job.url,
    fetchResource,
    blobToURL
  })

  // job.addResource('html-clean', html)
  let filepath = urlToFilename(job.url)
  if (filepath.substring(-1).charAt(0) === '/') {
    filepath = filepath + 'index.html'
  }
  job.addFile(filepath, html)

  job.baseFilePath = filepath

  next()

  async function fetchResource (...args) {
    const response = await ky(...args)
    return response
    // return ky(...args)
    // return got(...args)
  }

  async function blobToURL (blob, link) {
    // const name = hash(blob)
    console.log('make url', blob, link)
    const filename = urlToFilename(link.resource.url)
    job.addFile(filename, blob.toBuffer())
    return '/' + filename
  }
  // setTimeout(() => next(), 1000)
}

freeze.name = 'freeze-dry'

async function metascrape (job, next) {
  const html = job.getResource('html')
  const url = job.url
  const metadata = await metascraper({ html, url })
  job.addResource('metascrape', metadata)
  job.addDerivedFile('meta.json', Buffer.from(JSON.stringify(metadata)))
  next()
}

metascrape.name = 'metascrape'

function readable (job, next) {
  const html = job.getResource('html')
  const readable = readability(html, { href: job.url })
  job.addResource('readable', readable)
  const md = htmlToMd(readable.content)
  let content = `# ${readable.title}\n\n${md}`
  job.addDerivedFile('readable.md', content)
  next()
}

readability.name = 'readability'

async function saveFiles (job, next) {
  let drive = job.target.getStructure({ type: 'hyperdrive' })
  if (!drive) return

  const basename = job.baseFilePath || urlToFilename(job.url)

  for (let [filename, content] of Object.entries(job.files)) {
    if (typeof content === 'string') content = Buffer.from(content, 'utf8')
    if (!content) {
      job.error('No content set for file', filename)
      continue
    }
    await drive.api.writeFile(filename, content)
    job.log('Written file: ' + filename)
  }

  for (let [filename, content] of Object.entries(job.derivedFiles)) {
    // if (typeof content === 'string') content = Buffer.from(content, 'utf8')
    if (typeof content === 'string') {
      content = Buffer.from(content)
    }
    if (!content) {
      job.error('No content set for file', filename)
      continue
    }
    await drive.api.writeDerivedFile(basename, filename, content)
    job.log('Written derived file: ' + filename)
  }
  next()
}

function hash (blob) {
  let input = Buffer.from(blob)
  let output = Buffer.alloc(128)
  let hash = blake2b(output.length).update(input).digest('hex')
  return hash
}

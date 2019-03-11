import { getApi } from '@archipel/app/src/lib/api'
import { makeId } from '../common'

const jobs = {}

export function startImportJob (url, target, opts) {
  opts = opts || {}
  opts.backend = opts.api.importer
  const job = new ImportJob(url, target, opts)
  jobs[job.id] = job
  return job
}

export function getImportJob (id) {
  return jobs[id] || null
}

class ImportJob {
  constructor (url, target, opts) {
    this.id = makeId()
    this.url = url
    this.target = target

    this.backend = opts.backend

    this.state = {
      messages: []
    }

    this.subscribers = new Set()
  }

  async start () {
    this.setState({ started: true })

    let statusStream = await this.backend.start(this.id, this.url, this.target)

    statusStream.on('data', data => {
      this.setState(state => {
        let newState = state
        if (data.state) newState = { ...newState, ...data.state }
        if (data.message) newState = { ...newState, messages: [...state.messages, data.message] }
        return newState
      })
      this.backend.fullState(this.id).then(res => console.log('full state', res))
    })
  }

  setState (newState) {
    if (typeof newState === 'function') this.state = newState(this.state)
    else this.state = newState === this.state ? this.state : { ...this.state, ...newState }
    this.trigger()
  }

  watch (fn, init) {
    this.subscribers.add(fn)
    if (init) fn(this)
  }

  unwatch (fn) {
    this.subscribers.remove(fn)
  }

  trigger () {
    this.subscribers.forEach(fn => fn(this))
  }
}

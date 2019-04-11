import { getApi } from '../../lib/api'
import deepEqual from '@archipel/common/util/deepEqual'

export default function MemorizingTripleStore () {
  this.store = [['queries'], ['results']]
  this.tripleStore = null
  this.init()
  this.activateCleaner()
}

MemorizingTripleStore.prototype.init = async function () {
  this.tripleStore = await getApi().then((apis) => apis.hypergraph)
}

MemorizingTripleStore.prototype.activateCleaner = function (interval, cleaningSize) {
  if (!interval) interval = 300000
  if (!cleaningSize) cleaningSize = 100
  let reductionSize = Math.floor(cleaningSize * 3 / 4)

  this.cleaningInterval = setInterval(() => {
    let length = this.store.length
    if (length >= cleaningSize) {
      this.store[0] = this.store[0].slice(length - reductionSize)
      this.store[1] = this.store[1].slice(length - reductionSize)
    }
  }, interval)
}

MemorizingTripleStore.prototype.clearCleaner = function () {
  clearInterval(this.cleaningInterval)
}

MemorizingTripleStore.prototype.storeQuery = function (query, result) {
  this.store[0].push(query)
  this.store[1].push(result)
}

MemorizingTripleStore.prototype.restoreQuery = function (query) {
  let index = this.store[0].findIndex((elem) => deepEqual(elem, query))
  if (index >= 1) return this.store[1][index]
  return null
}

MemorizingTripleStore.prototype.get = async function (archive, query, opts) {
  let result = this.restoreQuery({ archive, query })
  if (result) return result
  result = await this.tripleStore.get(archive, query, opts)
  this.storeQuery({ archive, query }, result)
  return result
}

MemorizingTripleStore.prototype.searchSubjects = async function (archive, query, opts) {
  let result = this.restoreQuery({ archive, query })
  if (result) return result
  result = await this.tripleStore.searchSubjects(archive, query, opts)
  this.storeQuery({ archive, query }, result)
  return result
}

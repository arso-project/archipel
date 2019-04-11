'use strict'

import { useEffect } from 'react'
import getSchema, { Categories, getAllKeysAndLabels } from './schemas'
import { CATEGORY, triplesToMetadata } from './util'
import MemorizingTripleStore from './MemorizingTripleStore'

let tripleStore = new MemorizingTripleStore()
// initTripleStore()
// async function initTripleStore () {
//   tripleStore = await getApi().then((apis) => apis.hypergraph)
// }

let archive = null
let limit = 20

export default function hubController (props) {
}

hubController.categories = function () {
  return Categories.getLabel(-1)
}

hubController.setArchive = function (archiveKey) {
  archive = archiveKey
}

hubController.limit = function (newLimit) {
  if (newLimit) limit = newLimit
  return limit
}

// hubController.queryCategory = async function (category) {
//   console.log('hCqueryCategory', category, tripleStore)
//   category = Categories.getID(category)
//   console.log('hCqueryCategory', category, tripleStore)
//   let res = await tripleStore.get(archive, { predicate: CATEGORY, object: category })
//   console.log('hCqueryCategory', res)
//   let ret = []
//   res.forEach(triple => ret.push(this.getMetadataToSubject(triple.subject, category)))
//   return Promise.all(ret)
// }

// hubController.queryPredicate = async function (predicate, object) {
//   let res = await tripleStore.get(archive, { predicate: predicate || null, object: object || null })
//   console.log('queryPredicate', res)
//   let ret = []
//   res.forEach(triple => ret.push(this.getMetadataToSubject(triple.subject)))
//   return Promise.all(ret)
// }

hubController.querySubject = function (subject) {
  return tripleStore.get(archive, { subject })
}

hubController.search = async function (filterList) {
  let attributes = []
  for (let filter of filterList) {
    attributes.push(...filter.getAttributes())
  }
  let triples = []
  for (let pair of attributes) {
    triples.push({ predicate: pair.attribute, object: pair.assign })
  }
  let res = await tripleStore.searchSubjects(archive, triples, { limit })
  let ret = []
  res.forEach(triple => ret.push(this.getMetadataToSubject(triple.subject)))
  return Promise.all(ret)
}

hubController.getMetadataToSubject = async function (subject, category) {
  if (!category) {
    let { object } = await tripleStore.get(archive, { subject, predicate: CATEGORY })
    category = object
  }

  let schema
  if (category) schema = getSchema(category)
  let triples = await this.querySubject(subject)
  return triplesToMetadata(triples, schema)
}

hubController.getPossibleFilters = function () {
  return getAllKeysAndLabels()
}

// function GetTripleStore (interval) {
//   let memorizingTripleStore = new MemorizingTripleStore()

//   useEffect(() => {
//     memorizingTripleStore.activateCleaner(interval)

//     return () => memorizingTripleStore.clearCleaner()
//   }, [])

//   return memorizingTripleStore
// }

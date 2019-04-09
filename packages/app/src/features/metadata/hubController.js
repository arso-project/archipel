'use strict'

import { getApi } from '../../lib/api'
import React, { useEffect } from 'react'
import getSchema, { Categories, getAllKeysAndLabels } from './schemas'
import { CATEGORY, triplesToMetadata, metadataToTriples, cloneObject } from './util'

let tripleStore
initTripleStore()
async function initTripleStore () {
  tripleStore = await getApi().then((apis) => apis.hypergraph)
}

let archive = null

export default function hubController (props) {
}

// hubController.tripleStore = New

hubController.categories = function () {
  return Categories.getLabel(-1)
}

hubController.setArchive = function (archiveKey) {
  archive = archiveKey
}

hubController.queryCategory = async function (category) {
  console.log('hCqueryCategory', category, tripleStore)
  category = Categories.getID(category)
  console.log('hCqueryCategory', category, tripleStore)
  let res = await tripleStore.get(archive, { predicate: CATEGORY, object: category })
  console.log('hCqueryCategory', res)
  let ret = []
  res.forEach(triple => ret.push(this.getMetadataToSubject(triple.subject, category)))
  return Promise.all(ret)
}

hubController.queryPredicate = async function (predicate, object) {
  let res = await tripleStore.get(archive, { predicate: predicate || null, object: object || null })
  console.log('queryPredicate', res)
  let ret = []
  res.forEach(triple => ret.push(this.getMetadataToSubject(triple.subject)))
  return Promise.all(ret)
}

hubController.querySubject = function (subject) {
  return tripleStore.get(archive, { subject })
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

hubController.getFilter = function (comparisonPairs) { // x, y can be anything, 
  compar
}

// init tripleStore and simple memory wrapper to reduce remote queries

function MemorizingTripleStore (query) {
  this.store = [['queries'], ['results']]
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
  let index = this.store[0].findIndex((elem) => elem === query)
  if (index >= 1) return this.store[1][index]
  return null
}

MemorizingTripleStore.prototype.get = function (query) {
  let result = this.restoreQuery(query)
  if (result) return result
  result = tripleStore.get(query)
  this.storeQuery(query, result)
  return result
}


function GetTripleStore () {
  let memorizingTripleStore = null

  useEffect(() => {
    memorizingTripleStore = new MemorizingTripleStore()
    memorizingTripleStore.activateCleaner()

    return () => memorizingTripleStore.clearCleaner()
  }, [])

  return (
    memorizingTripleStore
  )
}

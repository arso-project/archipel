import React, { useEffect } from 'react'
import { useAsyncEffect, useAsyncState } from './hooks'
import { useApi, withApi, WithApi, Status } from './api'

class Cache {
  constructor () {
    this._cache = {}
    this._watch = {}
  }

  set (key, value) {
    this._cache[key] = value
    this._trigger(key)
  }

  has (key) {
    return this._cache.hasOwnProperty(key)
  }

  clear (key) {
    this._cache[key] = undefined
    this._trigger(key)
  }

  get (key) {
    return this._cache[key]
  }

  watch (key, fn) {
    this._watch[key] = this._watch[key] || []
    this._watch[key].push(fn)
  }

  unwatch (key, fn) {
    if (!this._watch[key]) return
    this._watch[key] = this._watch[key].filter(el => el !== fn)
  }

  _trigger (key) {
    if (!this._watch[key]) return
    this._watch[key].forEach(fn => fn(this._cache[key]))
  }
}

const CACHE = new Cache()
const makeKey = (method, args) => method + '||' + args.join('||')

export async function getCachedApi () {
  const api = await getApi()
  return {
    async get (method, args, onResult) {
      const key = makeKey(method, args)
      const cached = CACHE.get(key)
      if (!CACHE.has(key)) return this.fetch(method, args, onResult)
      if (onResult) {
        CACHE.watch(key, onResult)
      } 
      return CACHE.get(key)
    },

    async fetch (method, args, onResult) {
      const fn = method
        .split('.')
        .reduce((ret, key) => ret[key], api)

      let err, result
      try {
        result = await fn(...args)
      } catch (e) {
        err = e
      }

      const key = makeKey(method, args)

      if (onResult) {
        CACHE.watch(key, onResult)
      } 

      CACHE.set(key, [err, result])
      return result
    },

    unlisten (method, args, onResult) {
      const key = makeKey(method, args)
      CACHE.unwatch(key, onResult)
    }
  }
}


export function useApiCached (method, args, inputs) {
	const { state, setError, setPending, setSuccess, setStarted } = useAsyncState()

  useEffect(() => {
    let _mounted = true
    let cachedApi

    function onResult ([err, result]) {
      if (!_mounted) return
      if (err) setError(err)
      else setSuccess(result)
    }

    getCachedApi().then(_cachedApi => {
      cachedApi = _cachedApi
      cachedApi.get(method, args, onResult)
    })

    return () => {
      _mounted = false
      cachedApi.unlisten(method, args, onResult)
    }

  }, inputs)

	return state
}

const defaultState = { data: undefined, pending: false, error: false, started: false }


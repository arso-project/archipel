import websocket from 'websocket-stream'
import pump from 'pump'
import rpc from '@archipel/common/rpc'
import streambus from '@archipel/common/rpc/streambus'
import { prom, withTimeout } from '@archipel/common/util/async'

const TIMEOUT = 5000

const [api, setApi] = prom()
let created = false

export async function openApi (opts) {
  opts = opts || {}
  created = true
  opts.timeout = opts.timeout || TIMEOUT

  const websocketUrl = opts.websocketUrl
    || window.ARCHIPEL_WEBSOCKET_URL
    || window.location.origin.replace(/^http/, 'ws') + '/api'

  const stream = websocket(websocketUrl)
  const transport = streambus()
  pump(stream, transport.stream, stream)

  const client = rpc()
  const peer = await withTimeout(client.addPeer(transport), opts.timeout)
  const api = peer.api

  await api.hyperlib.open('lib') // todo: workspaces

  setApi(null, api)
  return api
}

export async function getApi (opts) {
  if (!created) await openApi(opts)
  return await api
}


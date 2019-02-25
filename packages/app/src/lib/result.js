import React, { useState } from 'react'
import { Spinner } from '@archipel/ui'
import { MdError } from 'react-icons/md'

export function useResult (props) {
  const [state, setState] = useState({})
  return {
    setError: error => setState({ error, pending: false }),
    setSuccess: success => setState({ success, pending: false }),
    setPending: () => setState({ pending: true }),
    result: state,
    Result: () => <Result {...props} {...state} />
  }
}

export function Result (props) {
  const { error, success, pending } = props
  const { renderError, renderSuccess, renderPending } = props
  if (!success && !pending && !error) return null

  if (pending && renderPending) return renderPending(error)
  if (error && renderError) return renderError(error)
  if (success && renderSuccess) return renderSuccess(success)

  if (pending) return <Spinner />

  let c = 'green'
  if (error) c = 'orange'

  let cls = `m-2 p-2 rounded max-w-lg border bg-${c}-lightest border-${c} text-${c}-dark`

  if (error) {
    return (
      <div className={cls + ' flex items-center'}>
        <div>
          <MdError size={24} className={`text-orange mr-2`} />
        </div>
        <div>
          {stringify(error)}
        </div>
      </div>
    )
  } else {
    return (
      <div className={cls}>
        {stringify(success)}
      </div>
    )
  }
}

export function Error (props) {
  const { error } = props
  return <Result error={error} />
}

function stringify (val) {
  if (val.toString()) return val.toString()
  if (typeof val === 'object') return JSON.stringify(val)
  return '' + val
}

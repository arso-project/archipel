import React from 'react'

export const Loading = () => <div>Loading ...</div>
export const Error = ({error}) => <div className='bg-red-light'>{error}</div>
export const Empty = () => <div>No data.</div>

const Maybe = (props) => {
  let {pending, error, data, children, render} = props
  render = render || children
  let cls = ''
  if (pending) cls = 'bg-yellow-lighter'

  return (
    <div className={cls} >
      { error && <Error error={error} />}
      { !empty(data) && render(data) }
    </div>
  )
}

export default Maybe

function empty (data) {
  if (!data) return true
  if (Array.isArray(data) && !data.length) return true
}

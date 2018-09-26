import React from 'react'

export const Loading = () => <div>Loading ...</div>
export const Error = ({error}) => <div className='bg-red-light'>{error}</div>
export const Empty = () => <div>No data.</div>

const Maybe = (props) => {
  console.log('in maybe', props)
  let {pending, error, data, children} = props
  // console.log('render maybe', pending, error, data, children)
  if (!pending && !error && !data) error = 'No data.'
  if (pending) return <Loading />
  if (error) return <Error error={error} />
  if (empty(data)) return <Empty />
  return children(data)
}

export default Maybe

function empty (data) {
  if (!data) return true
  if (Array.isArray(data) && !data.length) return true
}

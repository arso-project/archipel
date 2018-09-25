import React from 'react'

export const Loading = () => <div>Loading ...</div>
export const Error = ({error}) => <div className='bg-red-light'>{error}</div>

const Maybe = ({pending, error, data, children}) => {
  // console.log('render maybe', pending, error, data, children)
  if (!pending && !error && !data) error = 'No data.'
  if (pending) return <Loading />
  if (error) return <Error error={error} />
  return children(data)
}

export default Maybe

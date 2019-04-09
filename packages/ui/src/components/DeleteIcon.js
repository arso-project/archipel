import React from 'react'
import { MdClear } from 'react-icons/md'

export default function DeleteIcon (props) {
  let { size, onClick } = props
  return <button onClick={onClick}>
    {<MdClear size={size} className='text-red-light border border-red-light rounded-full' />}
  </button>
}

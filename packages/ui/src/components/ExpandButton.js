import React from 'react'
import { MdExpandMore, MdExpandLess } from 'react-icons/md'

const ExpandButton = (props) => {
  const { expanded, onClick, size, ...rest } = props
  return (
    <button onClick={onClick} className='hover:text-indigo'>
      { expanded ? <MdExpandLess size={size} /> : <MdExpandMore size={size} /> }
    </button>
  )
}

export default ExpandButton

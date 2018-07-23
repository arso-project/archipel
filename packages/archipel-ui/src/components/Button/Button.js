import React from 'react'

const Button = (props) => {
  return (
    <button className='Button'>
      {props.children}
    </button>
  )
}

export default Button

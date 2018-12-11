import React from 'react'
import { cls, proplist } from '../util.js'

import './Button.pcss'

const Button = (props) => {
  let cl
  if (props.small) cl = cls(props, 'btn btn-small')
  else cl = cls(props, 'btn btn-normal')
  let { small, ...rest } = props
  return (
    <button {...rest} className={cl}>
      {props.children}
    </button>
  )
}

export default Button

import React from 'react'
import { cls, proplist } from '../util.js'

import './Button.pcss'

const Button = (props) => {
  return (
    <button {...props} className={cls(props, 'btn')}>
      {props.children}
    </button>
  )
}

export default Button

import React from 'react'
import { classname } from '../util.js'

import './Button.pcss'

const Button = (props) => (
  <button {...classname(props, 'btn')}>
    {props.children}
  </button>
)

export default Button

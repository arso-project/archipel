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

export function FloatingButton (props) {
  const { icon, label, active, onClick } = props

  let cls = `text-grey-lighter hover:bg-blue-dark ${active ? 'bg-blue-dark is-active' : 'bg-black'} btn-floating`
  return (
    <div className={cls} onClick={onClick}>
      {icon}
    </div>
  )
}

export default Button

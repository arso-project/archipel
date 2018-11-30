import React from 'react'
import { MdCheck } from 'react-icons/md'
import { cls } from '../util.js'

import './Checkbox.pcss'

const Checkbox = (props) => {
  let { id, label, ...rest } = props
  return (
    <label htmlFor={id} {...props} className={cls(rest, 'chb')}>
      <input type='checkbox' value='1' id={id} />
      <MdCheck size={24} />
      <span>{label}</span>
    </label>
  )
}

export default Checkbox

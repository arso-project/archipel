import React from 'react'
import { MdCheck } from 'react-icons/md'
import { cls } from '../util.js'
import { InfoPopup } from '../'

import './Checkbox.pcss'

const Checkbox = (props) => {
  let { id, label, info, onChange, checked, ...rest } = props
  return (
    <label htmlFor={id} {...rest} className={cls(rest, 'chb')}>
      <input type='checkbox' value='1' id={id} onChange={onChange} checked={checked} />
      <MdCheck size={24} />
      <span>{label}</span>
      {info ? <InfoPopup info={info} /> : ''}
    </label>
  )
}

export default Checkbox

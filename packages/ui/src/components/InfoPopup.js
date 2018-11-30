import React from 'react'
import { MdInfoOutline } from 'react-icons/md'
import { cls } from '../util.js'

import './InfoPopup.pcss'

let clss = ['tooltip']

const InfoPopup = (props) => {
  let { info, ...rest } = props
  return (
    <div className={cls(rest, clss)}>
      <sup><MdInfoOutline /></sup>
      <span className='tooltiptext'>{info}</span>
    </div>
  )
}

export default InfoPopup

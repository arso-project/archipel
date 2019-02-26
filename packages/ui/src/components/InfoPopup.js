import React from 'react'
import { MdInfoOutline } from 'react-icons/md'
import { cls } from '../util.js'

import './InfoPopup.pcss'

let clss = ['tooltip']

const InfoPopup = (props) => {
  let { info, wInfo, ...rest } = props
  wInfo = wInfo || 'w-auto'
  return (
    <div className={cls(rest, clss)}>
      <sup><MdInfoOutline /></sup>
      <p className={wInfo + ' tooltiptext'}>{info}</p>
    </div>
  )
}

export default InfoPopup

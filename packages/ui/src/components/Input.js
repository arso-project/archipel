import React from 'react'
import { cls, proplist } from '../util.js'

let clss = ['leading-node border-2 px-4 py-2']
let defaults = {
  type: 'text'
}

const Input = (props) => {
  props = Object.assign({}, defaults, props)
  return (
    <input {...props} className={cls(props, clss)} />
  )
}

export default Input

import React from 'react'
import { proplist } from '../util'
import Tag from './Tag'

const Box = (props) => {
  const cls = ['p-4']
  return (
    <Tag {...proplist(props, cls)}>
      {props.children}
    </Tag>
  )
}

export default Box

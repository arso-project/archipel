import React from 'react'
import { proplist } from '../util'
import Tag from './Tag'

const sizes = [
  'text-xs',
  'text-sm',
  'text-base',
  'text-lg',
  'text-xl',
  'text-2xl',
  'text-3xl',
  'text-4xl',
  'text-5xl'
]

const Heading = ({ ...props }) => {
  if (!props.is) props.is = 'h2'
  props.cls = props.cls || []
  if (!props.noMy) props.cls.push('mb-4')
  if (!props.size) props.size = 2
  if (props.truncate) props.cls.push('truncate')
  props.cls.push(sizes[Number(props.size)])
  return (
    <Tag {...proplist(props, null, ['size', 'noMy', 'truncate'])}>
      {props.children}
    </Tag>
  )
}

export default Heading

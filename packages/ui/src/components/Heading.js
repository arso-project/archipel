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
  if (!props.noMy) props.cls.push('my-4')
  if (!props.fontSize) props.fontSize = 4
  props.cls.push(sizes[props.fontSize])
  return (
    <Tag {...proplist(props, null, ['size', 'noMy'])}>
      {props.children}
    </Tag>
  )
}

export default Heading

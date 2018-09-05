import React from 'react'
import { proplist } from '../util'
import Tag from './Tag'

const Heading = ({...props}) => {
  if (!props.is) props.is = 'h2'
  const cls = ['my-4']
  if (props.size) cls.push(`text-${props.size}-xl`)
  else cls.push(`text-xl`)
  return (
    <Tag {...proplist(props, cls, ['size'])}>
      {props.children}
    </Tag>
  )
}

export default Heading

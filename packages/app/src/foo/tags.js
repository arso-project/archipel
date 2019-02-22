import React, { useState, useContext, useEffect, useRef } from 'react'
import { List, Heading } from '@archipel/ui'

const CARD = {
  tag: 'foo',
  content: [
    { type: 'file', link: 'foo/bar' },
    { type: 'file', link: 'baz/bar' },
  ]
}

function Tags (props) {
  return (
    <div>
      Hello, world.
    </div>
  )
}

function Card (props) {
  const { tag, content } = props

  let cls = 'border-2 border-black m-2'
  let style = {
    width: '200px'
  }
  return (
    <div>
      <Heading>{tag}</Heading>
    </div>
    
  )
}

export default Tags

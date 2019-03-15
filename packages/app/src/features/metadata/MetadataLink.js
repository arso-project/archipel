/*
Component which may be inlcuded anywhere in the app, shows some metadata, and redirects to the MetadataHub, filtered for the metadata.
*/
import React from 'react'
import { Link } from '../../lib/router'

export default function MetadataLink (props) {
  let { className, target } = props
  console.log('MetadataLink', target)
  className = className || ''
  let cls = 'inline-block p-2 text-pink-dark font-bold ' + className
  let link = 'archive/:archive/hub/' + target

  return (
    <Link link={link}>
      <div className={cls}><span className='text-grey italic'>#</span>{target}</div>
    </Link>
  )
}

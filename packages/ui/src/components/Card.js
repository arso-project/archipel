import React from 'react'
import { classname } from '../util'
import Heading from './Heading'

const Footer = ({children}) => (
  <div className='-mx-4 -mb-4 mt-4 px-4 py-2 bg-grey-lighter border-t border-black text-xs'>
    {children}
  </div>
)

const Card = (props) => {
  return (
    <div {...classname(props, 'p-4 m-4 border-2 border-black')}>
      { props.title && <Heading className='mt-0'>{props.title}</Heading> }
      { props.children }
      { props.footer && <Footer>{props.footer}</Footer> }
    </div>
  )
}

export default Card

import React from 'react'
import { proplist } from '../util'
import Heading from './Heading'

const Footer = ({children}) => (
  <div className='-mx-4 -mb-4 mt-4 px-4 py-2 bg-grey-lighter border-t border-black text-xs'>
    {children}
  </div>
)

const Card = (props) => {
  return (
    <div {...proplist(props, 'p-4 border-2 border-black')}>
      { props.Title && <Heading className='mt-0'>{props.Title}</Heading> }
      { props.children }
      { props.Footer && <Footer>{props.Footer}</Footer> }
    </div>
  )
}

export default Card

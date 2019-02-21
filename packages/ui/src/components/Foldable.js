import React from 'react'

import Heading from './Heading'

// const defaultHeadline = () => <Heading className='text-grey-darker'>... –></Heading>

class Foldable extends React.Component {
  constructor (props) {
    super()
    this.state = { open: props.open || false }
    this.toggle = this.toggle.bind(this)
  }

  toggle () {
    this.setState({ open: !this.state.open })
  }

  render () {
    let { heading, render, children } = this.props
    // let triangle = this.state.open ? '▼' : '►'
    // triangle = <span className='text-sm w-6'>{triangle}</span>
    let triangle = ''
    render = render || children
    let realHeading
    if (typeof heading === 'string') {
      realHeading = ({ onClick, prefix }) => (
        <Heading truncate className='text-purple-dark cursor-pointer leading-none' noMy={1} fontSize={2} onClick={onClick}>{prefix} {heading}</Heading>
      )
    }
    let onClick = () => this.toggle()
    // let mainCls = 'px-4 py-3'
    let mainCls = 'px-2 py-2'
    if (this.state.open) mainCls += ' bg-yellow-lightest'
    return (
      <div className={mainCls}>
        {realHeading({ onClick, prefix: triangle })}
        {this.state.open &&
          <div className='mt-4'>
            {render}
          </div>
        }
      </div>
    )
  }
}

export default Foldable

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
    let triangle = this.state.open ? '▼' : '►'
    triangle = <span className='text-sm w-6'>{triangle}</span>
    render = render || children
    let realHeading
    if (typeof heading === 'string') {
      realHeading = ({ onClick, prefix }) => (
        <Heading className='text-purple-dark cursor-pointer mb-2' noMy={1} fontSize={2} onClick={onClick}>{prefix} {heading}</Heading>
      )
    }
    let onClick = () => this.toggle()
    let mainCls = 'p-2 mb-2' + (this.state.open ? ' bg-grey-lightest' : '')
    return (
      <div className={mainCls}>
        {realHeading({ onClick, prefix: triangle })}
        {this.state.open &&
          <div className='p-2'>
            {render}
          </div>
        }
      </div>
    )
  }
}

export default Foldable

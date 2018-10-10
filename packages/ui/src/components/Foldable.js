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
    // if (typeof heading === 'function') heading = () => heading
    render = render || children
    // let Headline
    // if (!heading) heading = '... ->'
    // if (typeof heading === 'string') Headline = <React.Fragment>{heading}</React.Fragment>
    // if (typeof heading === 'function') Headline = heading
    // // else Headline = defaultHeadline
    return (
      <div className='pb-2 mb-2'>
        <Heading className='text-purple-dark text-lg cursor-pointer ' onClick={() => this.toggle()}>{triangle} {heading}</Heading>
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

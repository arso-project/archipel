import React from 'react'

import Button from './Button'

const ModalElement = ({ children, onClose }) => (
  <React.Fragment>
    <div className='z-40 fixed pin overflow-auto bg-smoke flex text-black'>
      <div className='relative p-8 bg-white w-full max-w-md m-auto flex-col flex'>
        <span className='absolute pin-r pin-t m-8 cursor-pointer' onClick={onClose}>Close</span>
        {children}
      </div>
    </div>
  </React.Fragment>
)

class Modal extends React.Component {
  constructor () {
    super()
    this.state = { visible: false }
    this.onClick = this.onClick.bind(this)
    this.onKeydown = this.onKeydown.bind(this)
  }

  onClick () {
    this.setState({ visible: !this.state.visible })
  }

  onKeydown (e) {
    if (this.state.visible && e.keyCode === 27) this.onClick()
  }

  componentDidMount () {
    document.addEventListener('keydown', this.onKeydown, false)
  }

  componentWillUnmount () {
    document.removeEventListener('keydown', this.onKeydown, false)
  }

  render () {
    let { toggle, children } = this.props
    let toggleFunc
    if (typeof toggle === 'string') toggleFunc = (props) => <Button {...props}>{toggle}</Button>
    else toggleFunc = toggle
    return (
      <React.Fragment>
        {toggleFunc({ onClick: this.onClick })}
        { this.state.visible &&
          <ModalElement onClose={this.onClick}>
            {typeof children === 'function' ? children({ toggle: this.onClick }) : children}
          </ModalElement>
        }
      </React.Fragment>
    )
  }
}

export default Modal

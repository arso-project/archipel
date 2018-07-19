import React from 'react'
import styled from 'styled-components'
import posed, { PoseGroup } from 'react-pose'
import { tween } from 'popmotion'

const Item = ({title, className}) => <div className={className}>{title}</div>
const StyledItem = styled(Item)`
  padding: 10px;
  background: #ff0;
  text-align: center;
  margin: 5px;
`
const posedProps = {
  open: { opacity: 1 },
  closed: { opacity: 0 },
  enter: { opacity: 1 },
  exit: { opacity: 0 },
  flip: {
    transition: tween,
    delay: 500
  }
}

const Fade = posed.div(posedProps)

class PoseTest extends React.Component {
  constructor (props) {
    super(props)
    this.state = { visible: true, items: [1] }
  }
  render () {
    const { visible, items } = this.state
    return <div>
      <button onClick={(e) => this.setState({visible: !visible})}>Hello</button>
      <button onClick={(e) => this.setState({items: [...items, items.length + 1]})}>Add!</button>
      <PoseGroup>
        { items.map((i) => (
          <Fade pose={visible ? 'open' : 'closed'} data-key={i} key={i}>
            <StyledItem title={'hi there num ' + i} />
          </Fade>
        ))}
      </PoseGroup>
    </div>
  }
}

export default PoseTest

// // const Item = (props) => React.forwardRef(({title, className, hostRef}, ref) => <div className={className} ref={ref}>{title}</div>

// class Animate extends React.Component {
//   render () {
//     const { children, hostRef } = this.props
//     delete this.props.children
//     return <Fragment ref={hostRef}>{ React.cloneElement(children, this.props)}}</Fragment>
//   }
// }

// // class Item extends React.Component {
// //   render () {
// //     const {title, className, hostRef} = this.props
// //     return <div className={className} ref={hostRef}>{title}</div>
// //   }
// // }

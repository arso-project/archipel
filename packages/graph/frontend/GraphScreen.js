import React from 'react'
import { WithCore } from 'ucore/react'

class GraphTest extends React.Component {
  constructor () {
    super()
    this.state = { message: '' }
  }

  componentDidMount () {
    this.props.core.rpc.request('graph/test').then(
      ({ message }) => this.setState({ message })
    )
  }

  render () {
    return <div>{this.state.message}</div>
  }
}
const GraphScreen = () => (
  <WithCore>{core => <GraphTest core={core} />}</WithCore>
)

export default GraphScreen

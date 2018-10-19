import React from 'react'
import Maybe from './Maybe'
import { defaultAsyncState } from '../../lib/state-utils'
import { WithCore } from 'ucore/react'

export const defaultShouldRefetch = (prevProps, props) => {
  const keys = Object.keys(props)
  for (let i = 0; i < keys.length; i++) {
    if (props[keys[i]] !== prevProps[keys[i]]) return true
  }
  if (Object.keys(prevProps).length > keys.length) return true
  return false
}

class RpcQuery extends React.PureComponent {
  constructor (props) {
    super()
    this.state = defaultAsyncState()
    this.core = props.core
    this.shouldRefetch = props.shouldRefetch || defaultShouldRefetch
  }

  componentDidMount () {
    if (!this.state.started) {
      this.doFetch()
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.shouldRefetch(prevProps, this.props)) {
      this.doFetch()
    }
  }

  componentWillUnmount () {
    this.willUnmount = true
  }

  async doFetch () {
    this.setState({ pending: true, started: true })
    try {
      let [ type, req ] = this.props.fetch(this.props)
      let res = await this.core.rpc.request(type, req)
      if (this.willUnmount) return
      this.setState({ pending: false, data: res, error: false })
    } catch (error) {
      this.setState({ pending: false, error })
    }
  }

  render () {
    let { render, children } = this.props
    return (
      <Maybe {...this.state} render={render || children} />
    )
  }
}

const RpcQueryWrap = (props) => (
  <WithCore>{core => <RpcQuery {...props} core={core} />}</WithCore>
)

export default RpcQueryWrap

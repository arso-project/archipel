import React from 'react'
import Maybe from './Maybe'
import { defaultAsyncState } from '../../redux-utils'

export const defaultShouldRefetch = (prevProps, props) => {
  // console.log('shouldRefetch?', prevProps, props)
  const keys = Object.keys(props)
  for (let i = 0; i < keys.length; i++) {
    if (props[keys[i]] !== prevProps[keys[i]]) return true
  }
  if (Object.keys(prevProps).length > keys.length) return true
  return false
}

class BackendQuery extends React.PureComponent {
  constructor (props) {
    super()
    this.state = defaultAsyncState()
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

  async doFetch () {
    this.setState({ pending: true, started: true })
    try {
      const res = await this.props.fetch(this.props)
      this.setState({ pending: false, data: res.payload, error: res.error, meta: res.meta })
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

export default BackendQuery

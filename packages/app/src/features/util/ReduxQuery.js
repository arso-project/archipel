import React from 'react'
import { connect } from 'react-redux'
import { defaultShouldRefetch } from './Query'
import Maybe from './Maybe'

let cleanProps = props => {
  let {
    fetch,
    select,
    render,
    children,
    asyncState,
    ...rest
  } = props
  return rest
}

class ReduxQuery extends React.PureComponent {
  constructor (props) {
    super()
    this.shouldRefetch = props.shouldRefetch || defaultShouldRefetch
  }

  componentDidMount () {
    this.doFetch()
  }

  componentDidUpdate (prevProps, prevState) {
    // todo: clean this up
    if (!this.props.asyncState || (!this.props.asyncState.started || this.props.asyncState.pending)) {
      if (this.shouldRefetch(cleanProps(prevProps), cleanProps(this.props))) {
        this.doFetch()
      }
    }
  }

  async doFetch () {
    if (!this.props.asyncState || (!this.props.asyncState.started || this.props.asyncState.pending)) {
      this.props.fetch(cleanProps(this.props))
    }
  }

  render () {
    let { render, children } = this.props
    return (
      <Maybe {...this.props.asyncState} render={render || children} />
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  asyncState: ownProps.select(state, ownProps)
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  fetch: () => dispatch(ownProps.fetch(ownProps))
})

export default connect(mapStateToProps, mapDispatchToProps)(ReduxQuery)
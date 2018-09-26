'use strict'

import { connect } from 'react-redux'
import { foo, perftest } from '../../actions/debug.js'
import { setTitle, query } from '../../actions/index.js'
import React, { Component } from 'react'
import { Button, Heading } from '@archipel/ui'
import RootThing from '../debug/thing'

class Debug extends Component {
  constructor (props) {
    super(props)
    this.state = {input: 'foo'}
  }
  render () {
    console.log(this.props)
    const { title, doFooTest, doPerftest, doQuery } = this.props
    const query = (num) => () => {
      // doQuery(null, {subject: 'hr://n26b4ad0e-5bab-4b4f-bfb0-f108698724d9'})
      // doQuery(null, {predicate: 'rdf:type', object: 'hr:root'})
      if (num === 1) {
        // doQuery(null, {subject: 'hr://n26b4ad0e-5bab-4b4f-bfb0-f108698724d9'})
        doQuery(null, {subject: 'hr://paragraph-1'})
      }
      if (num === 2) {
        doQuery(null, {})
      }
    }
    return <div>
      <div className='p-4 text-white bg-blue-dark'>
        <Heading>{title}</Heading>
        <input onChange={(ev) => this.setState({input: ev.target.value})} value={this.state.input} className='p-2 mr-4' />
        <Button onClick={doPerftest('obj', 1)}>Do perftest 1</Button>
        <Button onClick={doPerftest('obj', 2)}>Do perftest 2</Button>
        <Button onClick={doPerftest('obj', 3)}>Do perftest 3 (long)</Button>
        <Button onClick={doPerftest('bin', 1)}>Do perftest bin</Button>
        <Button onClick={() => doFooTest(this.state.input)}>Do Foo Test</Button>
      </div>
      <div className='bg-grey p-4'>
        <Button onClick={query(1)}>Query 1</Button>
        <Button onClick={query(2)}>Query 2</Button>
        <div className='p-4 bg-white'>
          <RootThing />
        </div>
      </div>
    </div>
  }
}

const mapStateToProps = (state, props) => {
  return {
    title: state.title,
    theme: props.theme
  }
}

const mapDispatchToProps = dispatch => ({
  setTitle: (title) => dispatch(setTitle(title)),
  doPerftest: (type, id) => (e) => {
    console.log('do preftest comp', type, id)
    return dispatch(perftest(type, id))
  },
  doFooTest: (str) => dispatch(foo(str)),
  doQuery: (key, q) => dispatch(query(key, q))
})

export default connect(mapStateToProps, mapDispatchToProps)(Debug)

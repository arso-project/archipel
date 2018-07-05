'use strict'

import React, { Component } from 'react'

import { Button, Box, Flex, Heading, Input } from './base'
import Style from './style'
import Item from './item'

import RootThing from '../containers/thing'

export default class App extends Component {
  constructor (props) {
    super(props)
    this.state = {input: 'foo'}
  }
  render () {
    const {title, doFooTest, doStreamingTest, doStreamingTest2, doQuery, theme} = this.props
    const apiTestClick = () => {
      doStreamingTest('lets see if this works')
    }
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
      <Box px={4} py={5} color='white' bg='navy'>
        <Heading>{title}</Heading>
        <Input onChange={(ev) => this.setState({input: ev.target.value})} value={this.state.input} />
        <Button onClick={apiTestClick}>Do Streaming Test</Button>
        <Button onClick={doStreamingTest2}>Do Streaming Test 2</Button>
        <Button onClick={() => doFooTest(this.state.input)}>Do Foo Test</Button>
      </Box>
      <Box px={4} py={5} bg='gray1'>
        <Button onClick={query(1)}>Query 1</Button>
        <Button onClick={query(2)}>Query 2</Button>
        <Box p={2} bg='white'>
          <RootThing />
        </Box>
      </Box>
      <Item title='Hello' />
      <Box p={4}>
        <Style theme={theme} />
      </Box>
    </div>
  }
}

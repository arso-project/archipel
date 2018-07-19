import React from 'react'
import { Button, Box, Heading, Input } from '../base'

class Main extends React.Component {
  render () {
    const { archives } = this.props
    return (
      <Box p={4}>
        <Heading>Archipel: Somoco</Heading>
        <Heading py={3} fontSize={4}>Select Archive</Heading>
        <ul>
          { archives.map((a, i) => <li key={i}><a href={'/' + a.key}>{a.title}</a></li>)}
        </ul>
      </Box>
    )
  }
}

export default Main

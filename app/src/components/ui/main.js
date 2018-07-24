import React from 'react'
import { SquareButton, Box, Heading, Input } from '../base'

import { Card } from 'archipel-ui'

class Main extends React.Component {
  render () {
    const { archives } = this.props
    return (
      <Box p={4}>
        <Heading>Archipel: Somoco</Heading>
        <Heading py={3} fontSize={4}>Select Archive</Heading>
        <ul>
          { archives && archives.map((a, i) => <li key={i}><a href={'/' + a.key}>{a.title}</a></li>)}
        </ul>
        <SquareButton>Create Archive</SquareButton>
        <p>
          Test
          <Card Title={'Hello!'}>Foobar</Card>
        </p>
      </Box>
    )
  }
}

export default Main

import React from 'react'
import DebugContainer from '../containers/debug'
import MainContent from './ui/main'

import { Flex, Box } from './base.js'
import styled from 'styled-components'

const Wrapper = styled(Flex)`
  background-color: #eee;
  height: 100vh;
`

const HeaderBox = ({children}) => <Box p={2} bg='primary_dark' color='white' width='100%'>{children}</Box>
const HeaderBar = styled(HeaderBox)`
  height: 100px;
`
const FooterBar = ({children}) => <Box p={2} bg='primary_dark' color='white' width='100%'>{children}</Box>

class App extends React.Component {
  componentDidMount () {
    this.props.loadArchives()
  }
  render () {
    return <Wrapper flexDirection='column'>
      <HeaderBar>Header</HeaderBar>
      <Box flex={1}><MainContent /></Box>
      <FooterBar>Footer</FooterBar>
    </Wrapper>
    // return <Main archives={this.props.archives} />
    // return <DebugContainer />
  }
}

export default App

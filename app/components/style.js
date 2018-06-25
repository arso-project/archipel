import React, { Fragment } from 'react'
import { Box, Heading, Flex, Text, Button } from './base'

const Colorbox = ({color, name}) => (
  <Box py={4} bg={color} flex='1 0 auto'>
    <Text center color={name > 7 ? 'white' : 'black'}><strong>{name}</strong></Text>
  </Box>
)

const Colorsection = ({name, section}) => {
  let colors
  if (Array.isArray(section)) {
    colors = <Flex direction='row-reverse'>{
      section.map((color, i) => <Colorbox color={color} key={i} name={i} />) }
    </Flex>
  } else {
    colors = <Colorbox color={section} />
  }

  return (
    <Fragment>
      <Heading my={4}>{name.substr(0, 1).toUpperCase() + name.substr(1)}</Heading>
      {colors}
    </Fragment>
  )
}

class Style extends React.PureComponent {
  constructor () {
    super()
    this.state = { hidden: true }
  }

  render () {
    const {theme} = this.props
    const toggle = () => { this.setState({hidden: !this.state.hidden}) }
    const button = <Button onClick={toggle}>{this.state.hidden ? 'Show' : 'Hide'} styleguide</Button>
    if (this.state.hidden) return button
    return (
      <Fragment>
        {button}
        {!this.state.hiden && Object.keys(theme.palette).map((name) => (
          <Colorsection section={theme.palette[name]} name={name} key={name} />
        ))}
      </Fragment>
    )
  }
}

export default Style

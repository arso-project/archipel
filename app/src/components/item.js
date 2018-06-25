import React from 'react'
import { Box, Heading, Button } from './base'

const Item = ({title}) => (
  <Box p={4}>
    <Heading>{title}</Heading>
    <Button>OK</Button>
  </Box>
)

export default Item

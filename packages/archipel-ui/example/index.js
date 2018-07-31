import React from 'react'
import ReactDOM from 'react-dom'

import { Button, Heading, Card } from '../src/index.js'

import '../tailwind.pcss'

const lorem = 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.'

const Hr = () => <hr className='my-8 border-2 border-grey' />

const App = () => (
  <div className='m-4'>
    <Heading>Styleguide</Heading>
    <Button>Hello, world!</Button>
    <Hr />
    <div className='flex flex-wrap'>
      <Card s='max-w-sm m-2' Title='An example goes here'>{lorem}</Card>
      <Card s='max-w-sm m-2' Title='An example goes here'>{lorem}</Card>
      <Card s='max-w-sm m-2' Title='An example goes here'>{lorem}</Card>
      <Card s='max-w-sm m-2'
        Title='An example goes here'
        Footer={<span><a href='#'>Close</a> | Yeah</span>}
      >
        {lorem}
      </Card>
    </div>
  </div>
)

ReactDOM.render(<App />, document.getElementById('app'))

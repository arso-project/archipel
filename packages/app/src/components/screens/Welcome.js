import React from 'react'
import { Heading, Card } from '@archipel/ui'

class Main extends React.Component {
  render () {
    console.log(this.props.setScreen)
    return (
      <div className='p-4'>
        <Heading>Welcome!</Heading>
        <h4 className='text-blue cursor-pointer' onClick={(e) => this.props.setScreen('select')}>Go to SelectArchive</h4>
        <div className='py-4'>
          <Card s='max-w-md' Title={'Hello!'} Footer='Boo!' >Foobar</Card>
          <blockquote>
            <h4>Create Workspace (in DevConsole)</h4>
            <pre>rpc((api) => api.createWorkspace('Workspace name', (err, result) => console.log(err, result)))</pre>
          </blockquote>
        </div>
      </div>
    )
  }
}

export default Main

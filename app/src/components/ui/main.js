import React from 'react'
import { Heading, Button, Card } from 'archipel-ui'

class Main extends React.Component {
  render () {
    const { archives } = this.props
    return (
      <div className='p-4'>
        {/* <Heading className='text-4xl'>Archipel: Somoco</Heading> */}
        <Heading>Select Archive</Heading>
        <ul className='mb-4 list-reset'>
          { archives && archives.map((a, i) => (
            <li key={i}>
              <a className='py-1 text-blue-dark no-underline font-bold hover:underline' href={'/' + a.key}>
                {a.title}
              </a>
            </li>
          ))}
        </ul>
        <Button>Create Archive</Button>
        <div className='py-4'>
          <Card s='max-w-md' Title={'Hello!'} Footer='Boo!' >Foobar</Card>
        </div>
      </div>
    )
  }
}

export default Main

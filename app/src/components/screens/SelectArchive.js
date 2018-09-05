import React from 'react'
import { connect } from 'react-redux'
import { createArchive, uiSelectArchive } from '../../actions/index.js'
import { Heading, Button, Card } from 'archipel-ui'

class SelectArchive extends React.Component {
  constructor () {
    super()
    this.state = { title: '' }
  }
  render () {
    const { archives, createArchive, uiSelectArchive } = this.props
    return (
      <div className='p-4'>
        <Heading>Select Archive:</Heading>
        <ul>
          { Object.keys(archives).map(key => <li key={key}>
            <a className='text-blue underline cursor-pointer' onClick={(e) => uiSelectArchive(key)}>
              {archives[key].title} <em>{key}</em>
            </a></li>
          )}
        </ul>
        <div className='py-4'>
          {/* <Card s='max-w-md' Title={'Hello!'} Footer='Boo!' >Foobar</Card> */}
          <Heading>Create Archive</Heading>
          <div className='flex'>
            <label>Title:</label>
            <input onChange={(e) => this.setState({title: e.target.value})} />
          </div>
          <button onClick={(e) => this.state.title && createArchive(this.state.title)}>Create Archive</button>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  createArchive: (title) => {
    console.log('clicked createarchive')
    dispatch(createArchive(title))
  },
  uiSelectArchive: (key) => dispatch(uiSelectArchive(key))
})

const mapStateToProps = (state, props) => ({
  archives: state.archives
})

export default connect(mapStateToProps, mapDispatchToProps)(SelectArchive)

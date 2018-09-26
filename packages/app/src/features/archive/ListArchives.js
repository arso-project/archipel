import React from 'react'
import { List } from '@archipel/ui'
import { connect } from 'react-redux'
import { loadArchives } from './duck'
import Maybe from '../util/Maybe'

const Key = ({string}) => (
  <strong className=''>
    {string.substring(0, 8)}…
  </strong>
)

const ListItem = ({archive}) => {
  return (
    <span>
      <strong>{archive.title}</strong> <Key string={archive.key} />
    </span>
  )
}

class ListArchives extends React.Component {
  componentDidMount () {
    this.props.dispatch(loadArchives())
  }

  render () {
    const onSelect = this.props.onSelect || null
    return <Maybe {...this.props.archives}>
      {archives => {
        return <List
          items={archives}
          onSelect={onSelect}
          renderItem={item => <ListItem archive={item} />}
        />
      }}
    </Maybe>
  }
}

const mapStateToProps = (state, props) => ({
  archives: state.archives
})

export default connect(mapStateToProps)(ListArchives)

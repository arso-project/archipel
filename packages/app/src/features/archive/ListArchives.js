import React from 'react'
import { List } from '@archipel/ui'
import ReduxQuery from '../util/ReduxQuery'
import PropTypes from 'proptypes'

import { actions, select } from './duck'

const Key = ({string}) => (
  <strong className=''>
    {string.substring(0, 8)}…
  </strong>
)

const Archive = ({item, selected}) => {
  return (
    <span>
      <strong>{item.title}</strong> <Key string={item.key} />
    </span>
  )
}
const ListArchives = (props) => {
  return (
    <ReduxQuery select={select.sortedByName} fetch={actions.loadArchives} {...props} shouldRefetch={() => false}>
      {(archives) => <List items={archives} onSelect={props.onSelect} renderItem={item => <Archive item={item} />} />}
    </ReduxQuery>
  )
}

ListArchives.propTypes = {
  onSelect: PropTypes.func
}

export default ListArchives

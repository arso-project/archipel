import React from 'react'
import { List } from '@archipel/ui'
import PropTypes from 'proptypes'

const Key = ({ string }) => (
  <strong className=''>
    {string.substring(0, 8)}…
  </strong>
)

const Archive = ({ item, selected }) => {
  return (
    <span>
      <strong>{item.title}</strong> <Key string={item.key} />
    </span>
  )
}
const ListArchives = ({ archives, onSelect }) => {
  return (
    <List items={archives} onSelect={onSelect} renderItem={item => <Archive item={item} />} />
  )
}

ListArchives.propTypes = {
  onSelect: PropTypes.func
}

export default ListArchives

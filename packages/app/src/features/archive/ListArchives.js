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
      <strong>{item.info.title}</strong> <Key string={item.key} />
    </span>
  )
}
const ListArchives = ({ archives, onSelect, selected }) => {
  return (
    <List
      items={archives}
      onSelect={onSelect}
      selected={item => item.key === selected}
      renderItem={item => <Archive item={item} />} />
  )
}

ListArchives.propTypes = {
  onSelect: PropTypes.func
}

export default ListArchives

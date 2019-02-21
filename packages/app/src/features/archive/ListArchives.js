import React from 'react'
import { List } from '@archipel/ui'
import PropTypes from 'proptypes'

const Key = ({ string }) => (
  <span className='text-sm text-grey bg-grey-lightest px-1 rounded inline-block'>
    {string.substring(0, 4)}…
  </span>
)

const Archive = ({ item, selected }) => {
  return (
    <span>
      {item.info.title} <Key string={item.key} />
    </span>
  )
}
const ListArchives = ({ archives, onSelect, isSelected }) => {
  return (
    <List
      items={archives}
      onSelect={onSelect}
      isSelected={isSelected}
      // focus
      renderItem={item => <Archive item={item} />} />
  )
}

ListArchives.propTypes = {
  onSelect: PropTypes.func
}

export default ListArchives

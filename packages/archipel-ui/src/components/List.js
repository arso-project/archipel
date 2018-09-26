import React from 'react'

const defaultRender = item => item

const List = ({items, onSelect, renderItem}) => {
  if (!items) return <span>No items.</span>
  onSelect = onSelect || noop
  renderItem = renderItem || defaultRender
  return (
    <ul className='list-reset'>
      { items.map((item, i) => (
        <li className='p-2 m-1 bg-bright hover:bg-grey-lighter cursor-pointer overflow-hidden' key={i} onClick={onSelect(item)}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  )
}

export default List

function noop () {}

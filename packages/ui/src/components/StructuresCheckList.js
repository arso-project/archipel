import React from 'react'
import { Checkbox } from '..'

const StructuresCheckList = (props) => {
  let { structures, onSelect, selected, disabled, idSub, ...rest } = props
  if (!structures) return ''
  let listItems = structures.map(i => <li key={'reqAuthItem' + i.key}>
    <Checkbox id={idSub + i.key} label={i.type}
      checked={selected[i.key] || false}
      disabled={disabled ? disabled[i.key] : undefined}
      onChange={(e) => onSelect(e.target.checked, i.key)} />
  </li>)

  return (
    <ul className='list-reset'>
      {listItems}
    </ul>
  )
}

export default StructuresCheckList

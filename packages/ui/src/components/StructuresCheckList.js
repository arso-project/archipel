import React from 'react'
import { Checkbox } from '..'

const StructuresCheckList = (props) => {
  let { structures, onSelect, selected, disabled, idSub, indent, expanded, ...rest } = props

  if (expanded === undefined || expanded === null) expanded = true
  if (!structures) return ''

  let listItems = structures.map(i => <li key={'reqAuthItem' + i.key}>
    <Checkbox id={idSub + i.key} label={i.type}
      checked={selected[i.key] || false}
      disabled={disabled ? disabled[i.key] : undefined}
      onChange={(e) => onSelect(e.target.checked, i.key)} />
  </li>)

  if (expanded) {
    return (
      <div className={'pl-' + indent} >
        <ul className='list-reset'>
          {listItems}
        </ul>
      </div>
    )
  }

  return null
}

export default StructuresCheckList

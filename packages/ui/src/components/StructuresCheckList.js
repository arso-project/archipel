import React from 'react'
import { cls } from '../util.js'
import { Checkbox, InfoPopup } from '..'

const StructuresCheckList = (props) => {
  let { structures, onSelect, selected, ...rest } = props
  if (!structures) return ''
  console.log(structures)
  let listItems = structures.map(i => <li key={'reqAuthItem' + i.key}>
    <Checkbox id={'reqAuthItemCheck' + i.key} label={i.type}
      checked={selected[i.key] || false}
      onChange={(e) => onSelect(e.target.checked, i.key)} />
  </li>)

  return (
    <ul className='list-reset'>
      {listItems}
    </ul>
  )
}

export default StructuresCheckList

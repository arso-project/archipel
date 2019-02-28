import React, { useState, useMemo } from 'react'
import { List } from '@archipel/ui'
import { MdExpandMore, MdExpandLess, MdVpnKey, MdCloud } from 'react-icons/md'
import { useArchives } from './archive'

export default function ListArchives (props) {
  const { onSelect, selected } = props
  const archives = useArchives()
  const sortedArchives = useMemo(() => {
    return Object.values(archives).filter(a => a.info)
  }, [archives])
  return (
    <List
      items={sortedArchives}
      onSelect={onListSelect}
      isSelected={isSelected}
      // focus
      renderItem={item => <Archive item={item} />}
    />
  )

  function isSelected (archive) {
    return archive.key === selected
  }

  function onListSelect (archive) {
    return e => onSelect(archive.key)
  }
}

export function Archive (props) {
  const { item } = props
  const [expand, setExpand] = useState(false)

  const ExpandIcon = expand ? MdExpandLess : MdExpandMore
  let title = item.info.title || <em>{item.key.substring(0, 6)}…</em>

  return (
    <div>
      <div className='flex'>
        <div className='w-4 h-4 flex-0' onClick={onExpand}>
          <ExpandIcon />
        </div>
        <div className='flex-1'>
          {title}
        </div>
        <div className='flex-0'>
          <StructureStateIcons structure={item} />
        </div>
      </div>
      {expand && <Structures archive={item} />}
    </div>
  )

  function onExpand (e) {
    e.stopPropagation()
    setExpand(state => !state)
  }
}

function StructureStateIcons (props) {
  const { structure } = props
  const { state, key } = structure
  const { writable, share } = state
  let cls = val => {
    let color = val ? 'grey-dark' : 'grey-light'
    return `text-${color} ml-1`
  }
  return (
    <span className='text-s pl-2 inline-block h-4'>
      <MdVpnKey className={cls(writable)} />
      <MdCloud className={cls(share)} />
    </span>
  )
}

function Structures (props) {
  const { archive } = props
  archive.structures = archive.structures || []
  let structures = [archive, ...archive.structures]
  return (
    <div>
      {structures.map((struct, i) => (
        <div key={i} className='my-1 ml-4 text-grey-dark'>
          <span>{struct.type}</span> <Key string={struct.key} />
        </div>
      ))}
    </div>
  )
}

function Key (props) {
  const { string } = props
  return (
    <span className='text-sm text-grey bg-grey-lightest px-1 rounded inline-block'>
      {string.substring(0, 4)}…
    </span>
  )
}

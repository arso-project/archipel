import React, { useState } from 'react'
import { List } from '@archipel/ui'
import PropTypes from 'proptypes'
import { MdExpandMore, MdExpandLess, MdVpnKey, MdCloud } from 'react-icons/md'

const Key = ({ string }) => (
  <span className='text-sm text-grey bg-grey-lightest px-1 rounded inline-block'>
    {string.substring(0, 4)}…
  </span>
)

function StructureState (props) {
  const { structure } = props
  const { key } = structure
  const { writable, share } = structure.state
  let cls = 'text-grey-light'
  return (
    <span className='text-s pl-2 inline-block h-4'>
      {writable && <MdVpnKey className={cls} />}
      {share && <MdCloud className={cls} />}
    </span>
  )
}

const Archive = ({ item, selected }) => {
  const [expand, setExpand] = useState(false)

  let Icon = expand ? MdExpandLess : MdExpandMore
  let icon = <span onClick={onExpand} className='w-4 inline-block h-4'><Icon /></span>
  let title = item.info.title
  if (!title) title = <em>{item.key.substring(0, 6)}…</em>
  return (
    <span>
      {icon}
      {title}
      <StructureState structure={item} />
      {expand && <Structures archive={item} />}
    </span>
  )

  function onExpand (e) {
    e.stopPropagation()
    setExpand(state => !state)
  }
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

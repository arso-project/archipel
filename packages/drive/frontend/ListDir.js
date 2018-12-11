import React from 'react'
import { Consumer } from 'ucore/react'
import { MdFolder, MdInsertDriveFile } from 'react-icons/md'
import { StandardTree } from '@archipel/ui'

const ListDir = ({ archive, onSelect }) => {
  let stat = {
    name: 'ROOT',
    path: '/',
    isDirectory: true
  }

  const onTreeSelect = (node) => {
    onSelect(node.item)()
  }

  return (
    <StandardTree onSelect={onTreeSelect} keyboardFocus>
      <ListDirNode stat={stat} archive={archive} />
    </StandardTree>
  )
}

const ListDirNode = ({ archive, stat }) => (
  <StandardTree.Node
    id={stat.name}
    item={stat}
    icon={stat.isDirectory ? MdFolder : MdInsertDriveFile}
    label={stat.name}
    color={stat.isDirectory ? 'blue' : 'black'}
    expandable={stat.isDirectory}
  >
    {({ state, action }) => {
      return <ListDirChildren archive={archive} stat={stat} />
    }}
  </StandardTree.Node>
)

const ListDirChildren = ({ archive, stat }) => (
  <Consumer
    store='fs'
    select={'getChildrenSortedByName'}
    fetch={'fetchStats'}
    fetchOnChange={[archive, stat.path]}
    fetchOnResult={sel => stat.isDirectory && sel === undefined}

    archive={archive}
    path={stat.path}
  >
    {(dirs) => {
      if (!dirs) return <div>Loading</div>
      return (
        <div className='ml-2'>
          {dirs.map((stat, i) => (
            <ListDirNode
              archive={archive}
              stat={stat}
              key={i}
            />
          ))}
        </div>
      )
    }}

  </Consumer>
)

export default ListDir

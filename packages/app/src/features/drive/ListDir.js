import React from 'react'
import { Consumer } from 'ucore/react'
import { MdFolder, MdInsertDriveFile } from 'react-icons/md'
import { StandardTree } from '@archipel/ui'
import { StandardTreeNode } from '../../../../ui/src/components/Tree/StandardTree';

const ListDir = (props) => {
  const { archive, onSelect, grid, focus } = props
  let stat = {
    name: 'ROOT',
    path: '/',
    isDirectory: true
  }

  const onTreeSelect = (node) => {
    onSelect(node.item.stat)()
  }

  return (
    <StandardTree
      onSelect={onTreeSelect}
      keyboardFocus={focus}
      grid={grid}
      item={{ archive, stat }}
      nodeId={item => item.stat.name}
      renderNode={props => {
        const { stat } = props.item
        return (
          <StandardTreeNode {...props}
            Icon={stat.isDirectory ? MdFolder : MdInsertDriveFile}
            label={stat.name}
            color={stat.isDirectory ? 'blue' : 'black'}
            expandable={stat.isDirectory}
            grid={grid}
            renderChildren={({ item, Node }) => <ListDirChildren item={item} Node={Node} />}
          />
        )
      }}
    />
  )
}

const ListDirChildren = ({ item, Node }) => (
  <Consumer
    store='fs'
    select={'getChildrenSortedByName'}
    fetch={'fetchStats'}
    fetchOnChange={[item.archive, item.stat.path]}
    fetchOnResult={sel => item.stat.isDirectory && !sel}

    archive={item.archive}
    path={item.stat.path}
  >
    {(dirs) => {
      if (!dirs) return <div>Loading</div>
      return (
        <div className='ml-2'>
          {dirs.map((stat, i) => (
            <Node item={{ archive: item.archive, stat }} key={i} />
          ))}
        </div>
      )
    }}

  </Consumer>
)

export default ListDir

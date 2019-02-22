import React from 'react'
import { Consumer } from 'ucore/react'
import { MdFolder, MdInsertDriveFile } from 'react-icons/md'
import { StandardTree } from '@archipel/ui'
import { useApiCached, Status } from '../../lib/api.js'

import { useEntity } from '../../lib/api-entity.js'

function ListDir (props) {
  const { archive, onSelect, grid, focus } = props
  return (
    <ListDirItem link={{ key: archive, path: '/' }} onSelect={onSelect} />
  )
}

function ListDirItem (props) {
  const { link, onSelect } = props
  const entity = useEntity('stat', link)
  // console.log('entity', link, entity)
  if (!entity.data) return <Status {...entity} />

  let children
  if (typeof entity.children !== 'function') console.log('NO CHILDFUN', link, entity)
  else children = entity.children().map((child, i) => <ListDirItem {...props} key={i} link={child.link} />)

  return (
    <div className=''>
      <h2 onClick={onSelect(link.path)}>{link.path}</h2>
      <div className='ml-2'>
        {children}
      </div>
    </div>
  )


  // const state = useApiCached('hyperdrive.stat', [archive, path, 1], [archive, path])
  // if (!state.data) return <Status {...state} />
  // const stat = state.data
  // let children = null
  // if (stat.isDirectory) children = stat.children.map(child => <ListDirItem {...props} key={child.path} path={child.path} />)
  // return (
    // <div className=''>
      // <h2 onClick={onSelect(path)}>{path}</h2>
      // <div className='ml-2'>
        // {children}
      // </div>
    // </div>
  // )
}

const ListDirOld = (props) => {
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
          <StandardTree.Node {...props}
            Icon={stat.isDirectory ? MdFolder : MdInsertDriveFile}
            label={stat.name}
            color={stat.isDirectory ? 'blue' : 'black'}
            expandable={stat.isDirectory}
            grid={grid}
            renderChildren={({ item, Node }) => <CachedChildren item={item} Node={Node} />}
          />
        )
      }}
    />
  )
}

const ListDirChildrenNew = ({item, Node}) => {
  let archive = item.archive
  let statfoo = { name: 'foo', isDirectory: false }
  return <Node item={{archive, stat: statfoo}} />
  const state = useApiCached('hyperdrive.stat', [item.archive, item.stat.path, 1], [item.path])
  if (!state.data) return <Status {...state} />

  const stat = state.data
  if (!stat.children) return null
  console.log('ch', stat.children, item)
  return (
    <div className='ml-2'>
      {stat.children.map((stat, i) => (
        <Node item={{ archive: item.archive, stat }} key={i} />
      ))}
    </div>
  )
}
const CachedChildren = React.memo(ListDirChildrenNew)


// const ListDirChildren = ({ item, Node }) => (
  // <Consumer
    // store='fs'
    // select={'getChildrenSortedByName'}
    // fetch={'fetchStats'}
    // fetchOnChange={[item.archive, item.stat.path]}
    // fetchOnResult={sel => item.stat.isDirectory && !sel}

    // archive={item.archive}
    // path={item.stat.path}
  // >
    // {(dirs) => {
      // if (!dirs) return <div>Loading</div>
      // return (
        // <div className='ml-2'>
          // {dirs.map((stat, i) => (
            // <Node item={{ archive: item.archive, stat }} key={i} />
          // ))}
        // </div>
      // )
    // }}

  // </Consumer>
// )

export default ListDir

import React, { useState, useEffect, useRef, useMemo, useContext } from 'react'
import { Consumer } from 'ucore/react'
import { MdFolder, MdInsertDriveFile, MdExpandLess, MdExpandMore } from 'react-icons/md'
import { StandardTree } from '@archipel/ui'
import { StandardTreeNode } from '../../../../ui/src/components/Tree/StandardTree';
import { useRouter } from '../../lib/router'

import { StatUcoreLoader } from './FsScreen.js'

import { useFile } from './file'
import { useToggle, useKey } from '../../lib/hooks'
import { Status } from '../../lib/api'

function ListDir (props) {
  const { grid, focus, archive, path, onSelect} = props
  const treeRef = useRef()
  console.log(grid ? 'griddir' : 'dirtree', archive, path)

  // const { params, goto } = useRouter()
  // let { archive, wildcard } = params
  // let path = wildcard
  // if (!path) path = '/'

  useEffect(() => {
    if (!treeRef.current) return
    if (!path) return
    const tree = treeRef.current
    let newPath = path.split('/').filter(el => el)
    tree.runAction('select', ['ROOT', ...newPath])
    if (grid) tree.runAction('zoom', ['ROOT', ...newPath])
    
  }, [archive, path, grid])

  let stat = {
    name: 'ROOT',
    path: '/',
    isDirectory: true,
    key: archive
  }

  function onTreeSelect (node) {
    if (!node.item) return
    onSelect(node.item.path)
    // goto(['archive', archive, 'file', node.item.path])
  }

  function onTreeInit (tree) {
    treeRef.current = tree
  }

  return (
    <StandardTree
      init={onTreeInit}
      onSelect={onTreeSelect}
      keyboardFocus={focus}
      grid={grid}
      hideRoot
      item={stat}
      getId={item => item.name}
      renderNode={props => {
        const stat = props.item
        return (
          <StandardTreeNode {...props}
            Icon={stat.isDirectory ? MdFolder : MdInsertDriveFile}
            label={stat.name}
            color={stat.isDirectory ? 'blue' : 'black'}
            expandable={stat.isDirectory}
            renderChildren={({ item, Node }) => <ListDirChildren item={item} Node={Node} />}
          />
        )
      }}
    />
  )
}

function ListDirChildren (props) {
  const { item, Node } = props
  return (
    <Consumer
      store='fs'
      select={'getChildrenSortedByName'}
      fetch={'fetchStats'}
      fetchOnChange={[item.key, item.path]}
      fetchOnResult={sel => item.isDirectory && !sel}

      archive={item.key}
      path={item.path}
    >
      {(dirs) => {
        if (!dirs) return <div>Loading</div>
        return (
          <div className='ml-2'>
            {dirs.map((stat, i) => (
              <Node item={stat} key={i} />
            ))}
          </div>
        )
      }}
    </Consumer>
  )
}



import React, { useEffect } from 'react'
import { useApi, withApi, getApi } from '../../lib/api'
import { useTree, useKeyboardTree, getNodeState, setNodeState, S } from '@archipel/ui/src/components/Tree/Tree.js'
import { List } from '@archipel/ui'

async function fetchChildren (key, path, depth) {
  depth = depth || 1
  const api = await getApi()
  let stat = await api.hyperdrive.stat(key, path, depth)
  if (stat.children) {
    stat.children = stat.children.reduce((ret, stat) => {
      ret[stat.path] = stat
      return ret
    }, {})
  } else {
    stat.children = {}
  }
  return stat
}

const ListDir = withApi(
  function ListDir(props) {
    console.log('ListDir', props)
    let { archive, path, api, onSelect } = props
    path = path || '/'

    const tree = useKeyboardTree({ onSelect: onTreeSelect })
    const { setNodes, getNode } = tree
    console.log('render', tree, tree.getNode(archive))

    function onTreeSelect (path) {
      let [key, ...realPath] = path
      console.log('SELECT', path, onSelect)
      onSelect('/' + realPath.join('/'))()
    }

		useEffect(() => {
			let close = false
			let node = tree.getNode(archive)
			if (node && node.children) return
			tree.setNode(archive, node => ({ ...node, name: 'Root' }))
			tree.setState(archive, () => ({ expand: true }))
			fetchChildren(archive, '/', 2).then(stat => {
				if (close || !stat.children) return
				tree.setNodes(stat.children, [stat.key])
			})
			return () => { close = true }
		}, [archive, path])

    let node = getNode(archive)
    if (!node || !node.children) return null

		return <ListDirItem node={node} tree={tree} />

    return (
      <div>
        <h2>TREE</h3>
        <div>
          {Object.entries(node.children).map(([key, node]) => <ListDirItem key={key} node={node} tree={tree} />)}
        </div>
      </div>
    )
  }
)

const ListDirItem = React.memo(function ListDirItem (props) {
  const { node, tree } = props
  const path = [node.key, node.path]
  const state = getNodeState(node)

  useEffect(() => {
    let close = false
    // Check for unfetched children.
    if (node.isDirectory && !node.children) {
      fetchChildren(node.key, node.path).then(stat => {
        if (close || !stat.children) return
        tree.setNodes(stat.children, [stat.key])
      })
    } 
    return () => { close = true }
  }, path)

  let cls = ''
  if (state.focus) cls += 'bg-grey-light '
  else cls += 'bg-white '
  if (state.select) cls += 'text-red '
  else cls += node.isDirectory ? 'text-blue ' : 'text-black '

  return (
    <div>
      <strong className={cls} onClick={e => onClick()}>{node.name}</strong>
      {state.expand && node.children && (
        <div className='ml-4'>
          {Object.entries(node.children).map(([key, node]) => <ListDirItem key={key} node={node} tree={tree} />)}
        </div>
      )}
    </div>
  )
  
  function onClick () {
    if (node.isDirectory) tree.action('expand', path)
    else tree.action('select', path)
  }
}, (prevProps, nextProps) => prevProps.node === nextProps.node)

export default ListDir


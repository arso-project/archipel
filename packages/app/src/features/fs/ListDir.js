import React from 'react'
import { List } from '@archipel/ui'
import PropTypes from 'proptypes'
import { Consumer } from 'ucore/react'

const ListDirItem = (props) => {
  const { name, isDirectory } = props.item // also: path
  const color = isDirectory ? 'text-blue' : 'text-red'
  return <span className={color}>{name}</span>
}

function sortByProps (list, props) {
  return [...list].sort((a, b) => {
    return props.reduce((ret, prop) => {
      if (ret !== 0) return ret
      if (typeof prop === 'function') return prop(a, b)
      let order = 'asc'
      if (prop.indexOf(':')) {
        [prop, order] = prop.split(':')
      }
      if (a[prop] === b[prop]) return ret
      if (a[prop] > b[prop]) ret = 1
      if (a[prop] < b[prop]) ret = -1
      if (order === 'desc') ret = ret * -1
      return ret
    }, 0)
  })
}

function sort (list) {
  console.log('GOT DIRS!', list)
  return list
  // return sortByProps(list, ['isDirectory:desc', 'name'])
}

// function sortedSelectDir (state, props) {
//   const list = selectDir(state, props)
//   console.log(list)
//   return (list && list.length) ? sort(list) : list
// }

const ListDir = (props) => {
  const { archive, dir, onSelect } = props
  const id = archive + '/' + dir
  return (
    <Consumer store='fs' select={'getChildren'} init={'fetchStats'} id={id}>
      {(dirs) => {
        return <List items={sort(dirs)} onSelect={onSelect} renderItem={item => <ListDirItem item={item} />} />
      }}
    </Consumer>
  )
}

ListDir.propTypes = {
  archive: PropTypes.string,
  dir: PropTypes.string,
  onSelect: PropTypes.func
}

export default ListDir

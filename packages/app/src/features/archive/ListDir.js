import React from 'react'
import { List } from '@archipel/ui'
import ReduxQuery from '../util/ReduxQuery'
import PropTypes from 'proptypes'

import { loadDirlist, selectDir } from './duck'

const ListDirItem = (props) => {
  const { name, isDirectory } = props.item // also: path
  const color = isDirectory ? 'text-blue' : 'text-red'
  return <span className={color}>{name}</span>
}

const ListDir = (props) => {
  return (
    <ReduxQuery select={selectDir} fetch={loadDirlist} {...props}>
      {(dirs) => {
        return <List items={dirs} onSelect={props.onSelect} renderItem={item => <ListDirItem item={item} />} />}
      }
    </ReduxQuery>
  )
}

ListDir.propTypes = {
  archive: PropTypes.string,
  dir: PropTypes.string,
  onSelect: PropTypes.func
}

export default ListDir

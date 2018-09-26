import React from 'react'
import { List } from '@archipel/ui'
import { connect } from 'react-redux'

import { loadDirlist, selectDir } from './duck'

import Maybe from '../util/Maybe'

const ListDirItem = (props) => {
  const { path, name, isDirectory } = props.item
  const color = isDirectory ? 'text-blue' : 'text-red'
  return <span className={color}>{name}</span>
}

class ListDir extends React.Component {
  componentDidMount () {
    this.props.dispatch(loadDirlist(this.props.archive, this.props.dir))
  }

  componentDidUpdate (prevProps) {
    if (prevProps.archive !== this.props.archive || prevProps.dir !== this.props.dir) {
      this.props.dispatch(loadDirlist(this.props.archive, this.props.dir))
    }
  }

  render () {
    return <Maybe {...this.props.dirlist}>
      {(dirs) => <List items={dirs} onSelect={this.props.onSelect} renderItem={item => <ListDirItem item={item} />} />}
    </Maybe>
  }
}

const mapStateToProps = (state, props) => ({
  dirlist: selectDir(state, props.archive, props.dir)
})

export default connect(mapStateToProps)(ListDir)

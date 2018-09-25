import React from 'react'
import { List } from '@archipel/ui'
import { connect } from 'react-redux'

import { loadDirlist, selectDir } from './duck'

const Loading = () => <div>Loading ...</div>
const Error = ({error}) => <div className='bg-red-light'>{error}</div>

const Maybe = ({pending, error, data, children}) => {
  if (pending) return <Loading />
  if (error) return <Error error={error} />
  return children(data)
}

const ListDirItem = (props) => {
  const {path, name, isDirectory} = props.item
  console.log(props)
  const color = isDirectory ? 'text-blue' : 'text-red'
  return <span className={color}>{name}</span>
}

class ListDir extends React.Component {
  componentDidMount () {
    this.props.dispatch(loadDirlist(this.props.archive, this.props.dir))
  }

  render () {
    return <Maybe {...this.props.dirlist}>
      {(dirs) => <List items={dirs} renderItem={item => <ListDirItem item={item} />} />}
    </Maybe>
  }
}

const mapState = (state, props) => ({
  dirlist: selectDir(state, props.archive, props.dir)
})

export default connect(mapState)(ListDir)

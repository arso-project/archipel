import React from 'react'
import { List } from '@archipel/ui'
import PropTypes from 'proptypes'
import { Consumer } from 'ucore/react'
import { propsDidChange, sortByProps } from '../../lib/state-utils'

const ListDirItem = (props) => {
  const { archive, onToggle, toggled, childOnSelect, item } = props
  const { name, isDirectory } = item // also: path

  const color = isDirectory ? 'text-blue' : 'text-red'

  const Toggle = isDirectory ? <span onClick={onToggle(item)} className='p-2 bg-black text-white font-bold'>+</span> : null

  const Sub = toggled === item.path ? (
    <div className='ml-2'>
      <ListDir archive={archive} dir={item.path} onSelect={childOnSelect} />
    </div>
  ) : null

  return <div>{Toggle}<span className={color}>{name}</span>{Sub}</div>
}

function sort (list) {
  return sortByProps(list, ['isDirectory:desc', 'name'])
}

class ListDir extends React.Component {
  constructor (props) {
    super(props)
    this.state = { toggled: null }
    this.onToggle = this.onToggle.bind(this)
  }

  onToggle (item) {
    return (e) => {
      e.stopPropagation()
      this.setState({ toggled: item.path })
    }
  }

  componentWillReceiveProps (nextProps) {
    if (propsDidChange(this.props, nextProps, ['archive', 'dir'])) this.setState({ toggled: null })
  }

  render () {
    const { archive, dir, onSelect } = this.props
    const { toggled } = this.state

    return (
      <Consumer
        store='fs'
        select={'getChildren'}
        fetch={'fetchStats'}
        fetchOnChange={[archive, dir]}
        fetchOnResult={sel => sel === undefined}

        archive={archive}
        path={dir}
        toggled={toggled}>

        {(dirs) => {
          return (
            <List items={sort(dirs)} onSelect={onSelect} renderItem={item =>
              <ListDirItem archive={archive} item={item} toggled={toggled} onToggle={this.onToggle} childOnSelect={onSelect} />
            } />
          )
        }}

      </Consumer>
    )
  }
}

ListDir.propTypes = {
  archive: PropTypes.string,
  dir: PropTypes.string,
  onSelect: PropTypes.func
}

export default ListDir

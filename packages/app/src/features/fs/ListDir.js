import React from 'react'
import { List } from '@archipel/ui'
import PropTypes from 'proptypes'
import { Consumer } from 'ucore/react'
import { propsDidChange, sortByProps } from '../../lib/state-utils'

import { MdChevronRight, MdExpandMore, MdFolder, MdInsertDriveFile } from 'react-icons/md'

const ListDirItem = (props) => {
  const { archive, onToggle, toggled, childOnSelect, item } = props
  const { name, isDirectory } = item // also: path

  const color = isDirectory ? 'text-blue' : ''

  let toggleOnClick = isDirectory ? onToggle(item) : () => {}
  let Toggle = (
    <span onClick={toggleOnClick} className='w-8 inline-block'>
      { isDirectory && toggled && <MdExpandMore />}
      { isDirectory && !toggled && <MdChevronRight />}
    </span>
  )

  const Icon = isDirectory ? MdFolder : MdInsertDriveFile

  const Sub = toggled === item.path ? (
    <div className='ml-2'>
      <ListDir archive={archive} dir={item.path} onSelect={childOnSelect} />
    </div>
  ) : null

  return (
    <div>
      {Toggle}
      <span className={color}>
        <Icon />
        {name}
      </span>
      {Sub}
    </div>
  )
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

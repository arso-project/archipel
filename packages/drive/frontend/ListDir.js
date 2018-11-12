import React from 'react'
import { List } from '@archipel/ui'
import PropTypes from 'proptypes'
import { Consumer } from 'ucore/react'
import { propsDidChange, sortByProps } from '@archipel/app/src/lib/state-utils'

import { MdChevronRight, MdExpandMore, MdFolder, MdInsertDriveFile } from 'react-icons/md'

const ListDirItem = (props) => {
  const { archive, onToggle, toggled, childOnSelect, item, grid } = props
  const { name, isDirectory } = item // also: path

  const color = isDirectory ? 'text-blue' : ''

  let Toggle
  let Sub
  if (!grid) {
    let toggleOnClick = isDirectory ? onToggle(item) : () => {}
    Toggle = (
      <span onClick={toggleOnClick} className='w-8 inline-block'>
        { isDirectory && toggled && <MdExpandMore />}
        { isDirectory && !toggled && <MdChevronRight />}
      </span>
    )
    if (toggled === item.path) {
      Sub = (
        <div className='ml-2'>
          <ListDir archive={archive} dir={item.path} onSelect={childOnSelect} />
        </div>
      )
    }
  }

  const Icon = isDirectory ? MdFolder : MdInsertDriveFile

  if (!grid) {
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
  } else {
    return (
      <div className='p-1 text-center'>
        <Icon size={80} /><br />
        <span className={color}>{name}</span>
      </div>
    )
  }
}

function sort (list) {
  return sortByProps(list, ['isDirectory:desc', 'name'])
}

function filter (list, includeFiles) {
  if (!list) return []
  return list.filter(stat => {
    if (!includeFiles && !stat.isDirectory) return false
    return true
  })
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
    const { archive, dir, selected, full, onSelect } = this.props
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
            <React.Fragment>
              {!full && dir === '/' && <div onClick={onSelect('/')} className='cursor-pointer'>[Root]</div>}
              <List items={sort(filter(dirs, full))} onSelect={onSelect} grid={full} renderItem={item =>
                <ListDirItem
                  archive={archive}
                  item={item}
                  grid={full}
                  toggled={toggled}
                  onToggle={this.onToggle}
                  childOnSelect={onSelect} />
              } />

            </React.Fragment>
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

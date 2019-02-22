import React from 'react'

const defaultRender = item => item

class List extends React.Component {
  constructor (props) {
    super()
    this.state = { selected: -1 }
    this.onKeydown = this.onKeydown.bind(this)
  }

  onSelect (i) {
    let item = this.props.items[i]
    return (e) => {
      if (item && this.props.onSelect) this.props.onSelect(item, i)(e)
      else this.setState({ selected: i })
    }
  }

  onKeydown (e) {
    if (!this.props.focus) return

    let i = this.getSelected()
    if (this.props.focus && e.key === 'ArrowDown') {
      if (i < this.props.items.length - 1) i++
      else i = 0
    }
    if (this.props.focus && e.key === 'ArrowUp') {
      if (i < 1) i = this.props.items.length - 1
      else i--
    }
    if (i > -1) this.onSelect(i)(e)
  }

  componentDidMount () {
    document.addEventListener('keydown', this.onKeydown, false)
  }

  componentWillUnmount () {
    document.removeEventListener('keydown', this.onKeydown, false)
  }

  componentWillReceiveProps (newProps) {
    if ('selected' in newProps && newProps.selected !== this.state.selected) {
      this.setState({ selected: newProps.selected })
    }
  }

  getSelected () {
    let i = this.props.items.reduce((ret, item, i) => {
      if (ret !== null) return ret
      if (this.isSelected(item, i)) return i
      return null
    }, null)
    return i
  }

  isSelected (item, i) {
    if (this.props.isSelected) return this.props.isSelected(item, i)
    else return this.state.selected === i
  }

  render () {
    let { items, renderItem, children, grid, focus, className } = this.props
    className = className || ''
    if (!items) return <span>No items.</span>
    // const clsItem = 'px-4 py-3 leading-none m-0 cursor-pointer overflow-hidden '
    const clsItem = 'px-2 py-2 leading-none m-0 cursor-pointer overflow-hidden '
    let clsBase = 'list-reset ' + className
    // if (focus) clsBase += ' border border-teal'
    renderItem = renderItem || children || defaultRender
    return (
      <ul className={clsBase}>
        { items.map((item, i) => {
          // let cls = clsBase + (isSelected(item, i) ? 'bg-teal-dark hover:bg-teal-dark' : 'bg-bright hover:bg-teal')
          let cls = clsItem
          cls += ' truncate '
          // cls += (this.isSelected(item, i) ? 'text-red ' : 'hover:text-red')
          cls += (this.isSelected(item, i) ? 'bg-grey-lighter ' : 'hover:bg-grey-lighter ')
          // if (!grid) cls += i % 2 === 0 ? ' bg-grey-lightest ' : ' '
          let key = typeof item === 'object' && item.id ? item.id : i
          if (grid) cls += ' float-left border-transparent border-8'
          return (
            <li className={cls} key={key} onClick={this.onSelect(i)}>
              {renderItem(item, i)}
            </li>
          )
        })}
      </ul>
    )

  }
}

// const List = ({ items, onSelect, renderItem, children }) => {
//   if (!items) return <span>No items.</span>
//   onSelect = onSelect || noop
//   renderItem = renderItem || children || defaultRender
//   return (
//     <ul className='list-reset'>
//       { items.map((item, i) => (
//         <li className='p-2 m-1 bg-bright hover:bg-grey-lighter cursor-pointer overflow-hidden' key={i} onClick={onSelect(item, i)}>
//           {renderItem(item, i)}
//         </li>
//       ))}
//     </ul>
//   )
// }

export default List

function noop () {}

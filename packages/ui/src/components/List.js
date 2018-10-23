import React from 'react'

const defaultRender = item => item

class List extends React.Component {
  constructor (props) {
    super()
    this.state = { selected: props.selected }
  }

  onSelect (item, i) {
    return (e) => {
      this.setState({ selected: i })
      if (this.props.onSelect) this.props.onSelect(item, i)(e)
    }
  }

  render () {
    const self = this
    let { items, renderItem, children } = this.props
    if (!items) return <span>No items.</span>
    const clsBase = 'p-2 m-1 cursor-pointer overflow-hidden '
    renderItem = renderItem || children || defaultRender
    return (
      <ul className='list-reset'>
        { items.map((item, i) => {
          // let cls = clsBase + (isSelected(item, i) ? 'bg-teal-dark hover:bg-teal-dark' : 'bg-bright hover:bg-teal')
          let cls = clsBase + (isSelected(item, i) ? 'bg-grey-lightest' : 'hover:bg-grey-lightest')
          let key = typeof item === 'object' && item.id ? item.id : i
          return (
            <li className={cls} key={key} onClick={this.onSelect(item, i)}>
              {renderItem(item, i)}
            </li>
          )
        })}
      </ul>
    )

    function isSelected (item, i) {
      if (self.props.selected) {
        if (typeof self.props.selected === 'function') {
          return self.props.selected(item)
        } else return self.props.selected === i
      } else if (self.state.selected === i) {
        return true
      }
      return false
    }
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

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
    let { items, renderItem, children } = this.props
    let { selected } = this.state
    if (!items) return <span>No items.</span>
    const clsBase = 'p-2 m-1 cursor-pointer overflow-hidden '
    renderItem = renderItem || children || defaultRender
    return (
      <ul className='list-reset'>
        { items.map((item, i) => {
          let cls = clsBase + (selected === i ? 'bg-teal' : 'bg-bright hover:bg-teal')
          return (
            <li className={cls} key={i} onClick={this.onSelect(item, i)}>
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

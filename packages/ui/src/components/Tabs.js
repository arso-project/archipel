import React from 'react'
import List from './List'

const TabHeader = ({ tabs, selected, onSelect }) => (
  <List items={tabs} onSelect={onSelect} selected={selected}>
    {(tab, i) => tab.title}
  </List>
)

const TabContent = ({ tabs, selected, props }) => {
  if (!(tabs[selected] && tabs[selected].component)) return null
  const Component = tabs[selected].component
  return <Component {...props} />
}

class Tabs extends React.Component {
  constructor (props) {
    super()
    this.state = { selected: null }
    if (props.tabs.length) this.state.selected = 0
    this.onSelect = this.onSelect.bind(this)
  }

  onSelect (tab, i) {
    return (e) => this.setState({ selected: i })
  }

  render () {
    const { tabs, ...props } = this.props
    const { selected } = this.state
    return (
      <div className='flex'>
        <TabHeader tabs={tabs} onSelect={this.onSelect} selected={selected} />
        <div className='flex-1'>
          <TabContent tabs={tabs} selected={selected} props={props} />
        </div>
      </div>
    )
  }
}

export default Tabs

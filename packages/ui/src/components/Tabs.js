import React from 'react'
import List from './List'

const TabHeader = ({ tabs, selected, onSelect, ...props }) => (
  <List items={tabs} onSelect={onSelect} selected={selected} {...props}>
    {(tab, i) => tab.title}
  </List>
)

const TabContent = ({ tabs, selected, passProps }) => {
  if (!(tabs[selected] && tabs[selected].component)) return null
  const Component = tabs[selected].component
  return <Component {...passProps} />
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
    let { tabs, direction, Wrapper, passProps } = this.props
    direction = direction || 'horizontal'
    let horizontal = direction === 'horizontal'
    const { selected } = this.state
    let wrapperCls = horizontal ? 'flex flex-col' : 'flex'
    let headerCls = horizontal ? 'flex' : ''
    let bodyCls = horizontal ? 'flex-1' : 'ml-4 flex-1'
    let content = <TabContent tabs={tabs} selected={selected} passProps={passProps} />
    if (Wrapper) content = <Wrapper {...passProps}>{content}</Wrapper>
    return (
      <div>
        <div className={wrapperCls}>
          <TabHeader className={headerCls} tabs={tabs} onSelect={this.onSelect} selected={selected} />
          <div className={bodyCls}>
            {content}
          </div>
        </div>
      </div>
    )
  }
}


export default Tabs

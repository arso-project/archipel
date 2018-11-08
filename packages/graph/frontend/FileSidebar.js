import React from 'react'
import { Input, Button, Foldable, List, Heading } from '@archipel/ui'
import { WithCore, Consumer } from 'ucore/react'

class GNDSearch extends React.Component {
  constructor (props) {
    super(props)
    this.state = { search: '', items: [] }
    this.core = props.core
    this.inputRef = React.createRef()
    this.onSearchClick = this.onSearchClick.bind(this)
    this.onInputChange = this.onInputChange.bind(this)
    this.onSelect = this.onSelect.bind(this)
  }

  onInputChange (e) {
    this.setState({ search: e.target.value })
  }

  onSelect (item) {
    let self = this
    return async function (e) {
      let triples = []
      triples.push({
        subject: self.props.id,
        predicate: 'archipel://relatedTo',
        object: item.id
      })
      triples.push({
        subject: item.id,
        predicate: 'archipel://label',
        object: item.name
      })
      let res = await self.core.rpc.request('graph/put', { triples, key: self.props.archive })
      self.setState({ done: res.done })
      self.core.getStore('graph').query({ query: { subject: self.props.id }, key: self.props.archive })
    }
  }

  async onSearchClick (e) {
    let val = this.state.search
    if (!val) return
    let res = await fetch(`https://lobid.org/gnd/search?q=${val}&format=json`)
    let body = await res.json()
    let member = body.member
    let items = []
    if (member.length) {
      items = member.map(member => {
        return {
          id: member.id,
          type: member.type,
          name: member.preferredName
        }
      })
    }
    this.setState({ items })
  }

  render () {
    return (
      <div>
        <Heading>Add from GND</Heading>
        <Input onChange={this.onInputChange} value={this.state.search} />
        <Button onClick={this.onSearchClick}>Search</Button>
        <List items={this.state.items} onSelect={this.onSelect}>
          {item => {
            return (
              <div>{item.name}<br />
                <span className='text-xs'>{item.type.join(', ')}</span>
              </div>
            )
          }}
        </List>
      </div>

    )
  }
}

class InitSubject extends React.Component {
  constructor (props) {
    super(props)
    this.store = props.store
    this.core = this.store.core
    this.onInit = this.onInit.bind(this)
    this.state = { done: false }
  }

  async onInit (e) {
    let triples = []
    triples.push({
      subject: this.props.id,
      predicate: 'archipel://filesize',
      object: this.props.stat.size
    })
    let res = await this.core.rpc.request('graph/put', { triples, key: this.props.archive })
    this.setState({ done: res.done })
    this.store.query({ subject: this.props.id })
  }

  render () {
    return (
      <Button onClick={this.onInit}>Init</Button>
    )
  }
}

let Item = ({ title, children, value }) => {
  value = children || value
  return (
    <div className='border-b border-grey pb-1 mb-1'>
      <div>{title}</div>
      <div className='truncate font-bold'>{value}</div>
    </div>
  )
}

const Sidebar = (props) => {
  const { stat, archive, path } = props
  let id = makeId(archive, path)
  return (
    <div>
      <Consumer store='graph' select='byId' fetch='query' query={{ subject: id }} archive={archive} id={id}>
        {(subject, store) => {
          console.log('CONSUMER sub', subject)
          if (!subject) return <InitSubject {...props} store={store} id={id} />
          else {
            let list = Object.keys(subject).reduce((res, cur) => {
              if (cur === id) return
              let val = subject[cur]
              if (!Array.isArray(val)) val = [val]
              val.forEach(v => res.push({ title: cur, value: v }))
              return res
            }, [])
            return (
              <div>
                <div>
                  {list.map((item, i) => <Item {...item} key={i} />)}
                </div>
                <WithCore>
                  {core => (
                    <GNDSearch stat={stat} core={core} id={id} archive={archive} />
                  )}
                </WithCore>
              </div>
            )
          }
        }}
      </Consumer>
    </div>
  )
}

export default Sidebar

function makeId (key, path) {
  if (path.charAt(0) === '/') path = path.substring(1)
  return `dat://${key}/${path}`
}

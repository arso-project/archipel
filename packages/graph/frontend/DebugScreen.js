import React from 'react'
import { Heading, List, Foldable } from '@archipel/ui'
import { WithCore, Subscriber, Consumer, WithStore } from 'ucore/react'
import { BooleanValue } from 'react-values'
// import { makeSchema } from './store'
import { isLiteral } from './util'


class GraphTest extends React.Component {
  constructor () {
    super()
    this.state = { message: '' }
  }

  componentDidMount () {
    this.props.core.rpc.request('graph/test').then(
      ({ message }) => this.setState({ message })
    )
  }

  render () {
    return <div>{this.state.message}</div>
  }
}

const Subject = ({ data }) => {
  return (
    <div>
      {Object.keys(data).map(key => <div key={key}><strong>{key}: </strong>{data[key]}</div>)}
    </div>
  )
}

const BigList = () => (
  <Consumer
    store='graph'
    select='byType'
    fetch='query'
    fetchOnResult={subs => Object.keys(subs).length === 0}
    query={{ }}
  >
    {(types) => {
      types = Object.keys(types).reduce((ret, type) => { ret.push({ type, ids: types[type] }); return ret }, [])
      if (!types.length) return <div>Nothing</div>
      return (
        <ul>
          {types.map(({ type, ids }) => (
            <Foldable heading={type} key={type}>
              <Consumer store='graph' select='byIds' ids={ids}>
                {subjects => <List items={subjects} renderItem={data => <Subject data={data} />} />}
              </Consumer>
            </Foldable>
          ))}
        </ul>
      )
    }}
  </Consumer>
)

const Value = ({ value }) => {
  if (isLiteral(value)) return <em>{value}</em>

}

const Thing = ({ id }) => {

}

const labelProps = [
  'dcterms:title',
  'rdfs:label'
]

// const labelProps = [
//   'skos:definition',
//   'rdfs:comment'
// ]

const Label = ({ subject, onClick, value }) => {
  if (!subject) return <span>Undefined.</span>
  let label = labelProps.reduce((res, prop) => res || subject[prop], false)
  if (!label) label = ''
  let cls = ''
  // cls += value ? 'bg-grey-light hover:bg-grey' : 'bg-grey-lightest hover:bg-grey-light'
  if (onClick) cls += ' cursor-pointer '
  let Label = <em>{label}</em>
  let Id = <strong className='text-blue'>{subject.id}</strong>

  // return <Heading className={cls} fontSize={2} onClick={onClick}>{label}</Heading>
  return <div className={cls} onClick={onClick}>{Id} {Label}</div>
}

const ItemWrapper = ({ level, children }) => {
  level = level || 0
  let bg = ['#fafafa', '#f0f0f0', '#eaeaea', '#e0e0e0', '#dadada', '#d0d0d0'][level]
  let style = { backgroundColor: bg }
  return (
    <div className='max-w-md px-2 py-1 mb-2' style={style}>
      {children}
    </div>
  )
}

const SchemaProp = ({ id, schema, subjects, collapsed, level }) => {
  let subject = subjects[id]
  let baseProps = { schema, subjects }
  return (
    <BooleanValue defaultValue={!collapsed}>
      {({ value, toggle }) => (
        <ItemWrapper level={level}>
          <Label subject={subject} onClick={toggle} />
          { value && <div className='pl-2'>
            <Heading fontSize={2}>Value range:</Heading>
            { schema.takesClass[id] && schema.takesClass[id].map(id => <SchemaClass key={id} {...baseProps} id={id} collapsed />)}
          </div>}
        </ItemWrapper>
      )}
    </BooleanValue>
  )
}

const SchemaClass = ({ id, schema, subjects, collapsed, level }) => {
  let subject = subjects[id]
  level = level || 0
  let baseProps = { schema, subjects, level: level + 1 }
  return (
    <BooleanValue defaultValue={!collapsed}>
      {({ value, toggle }) => (
        <ItemWrapper level={level}>
          <Label subject={subject} onClick={toggle} value={value} />
          { value && <div className='pl-2'>
            <Heading fontSize={2}>Refine:</Heading>
            {schema.childClasses[id] &&
              <ul className='list-reset pl-2'>
                {schema.childClasses[id].map(id => <li key={id}><SchemaClass {...baseProps} key={id} id={id} collapsed /></li>)}
              </ul>
            }
            <Heading fontSize={2}>Own props:</Heading>
            {schema.takesProperty[id] &&
              <ul className='list-reset pl-2'>
                {schema.takesProperty[id].map(id => <li key={id}><SchemaProp {...baseProps} key={id} id={id} collapsed /></li>)}
              </ul>
            }
            <Heading fontSize={2}>Inherited props:</Heading>
            {schema.parentClasses[id] &&
              <ul className='list-reset pl-2'>
                {schema.parentClasses[id].map(parentId => (
                  parentId !== 'ROOT' && schema.takesProperty[parentId] &&
                  schema.takesProperty[parentId].map(id => <li key={id}><Label key={parentId + id} subject={subjects[id]} /></li>)
                ))}
              </ul>}
          </div>}
        </ItemWrapper>
      )}
    </BooleanValue>

  )
}

const SchemaBrowserContainer = () => (
  <Consumer store='graph' select={['all', 'schema']}>
    {([subjects, schema]) => <SchemaBrowser subjects={subjects} schema={schema} roots={['bf:Work', 'bf:Item', 'bf:Instance', 'as:Object', 'oa:annotation']} />}
  </Consumer>
)

const SchemaBrowser = ({ subjects, schema, roots }) => {
  console.log('SchemaBrowser', schema, subjects)
  if (!schema) return <div>No schema.</div>
  return <div>{roots.map(name => <SchemaClass key={name} id={name} schema={schema} subjects={subjects} collapsed />)}</div>
}

const GraphScreen = () => (
  <div>
    <Heading>GRAPH</Heading>
    <WithCore>{core => <GraphTest core={core} />}</WithCore>
    <SchemaBrowserContainer />
    <BigList />
  </div>
)

export default GraphScreen

'use strict'
import React from 'react'
import { connect } from 'react-redux'
import { uiTree } from '../actions'

import { isThing, isLiteral, fromRdfValue, getPropsFromTree } from '../util'
import { Box, Flex } from 'rebass'
import styled from 'styled-components'
import chroma from 'chroma-js'

const mapStateToProps = (state, props) => {
  return {
    things: state.things.all,
    byType: state.things.byType,
    tree: state.ui.tree
  }
}

const mapDispatchToProps = dispatch => ({
  setUiTree: (path, props) => dispatch(uiTree(path, props))
})

const Ul = styled.ul`margin: 0; padding: 0; li { list-style-type: none; } `
const Token = styled.span`
  color: #906;
  font-size: .9em;
  font-weight: bold;
  font-style: normal;
  margin-right: .5em;
`
const Pred = styled(Token)`
`
const Prop = styled(Pred)`color: #845;`
const Id = styled(Token)`
  color: #758;
//  max-width: 10em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Type = styled(Token)`
  color: #609;
`

const Val = ({value}) => {
  const V = styled(Token)`
    color: #220;
  `
  return <V>{fromRdfValue(value)}</V>
}

const RootThing = ({ things, byType }) => {
  if (!Object.keys(things).length) {
    return <em>Nothing.</em>
  }

  var rootKey = 'hr:root'

  if (!byType[rootKey]) return <em>No root.</em>
  let id = byType[rootKey][0]

  return (
    <div>
      <h2>Things</h2>
      <ThingC thing={things[id]} level={1} path={[id]} />
    </div>
  )
}

const Thing = ({ things, thing, level, predicate, path, tree, setUiTree }) => {
  const click = (e) => {
    e.stopPropagation()
    setUiTree(path, {_show: !isVisible()})
  }

  const isVisible = () => {
    let props = getPropsFromTree(tree, path)
    if (props && props._show) return true
    else return false
  }

  const visible = isVisible()

  if (!thing || !(typeof thing === 'object')) return '<div>CANNOT SHOW!</div>'
  let props = Object.keys(thing)
  const Head = <Flex>{predicate ? <Pred>{predicate}</Pred> : ''}<Type>{thing.type}</Type><Id>{thing.id}</Id></Flex>
  let Lits = ''
  let Rels = ''

  if (visible) {
    props = props.filter((p) => ['id', 'type'].indexOf(p) === -1)
    // Todo: What about mixed props?
    let literals = props.filter((key) => isLiteral(thing[key][0]))
    let rels = props.filter((key) => isThing(thing[key][0]))

    // let filterRels = 'co:'
    // let filterRels = 'po:contains'
    // rels = rels.filter((key) => !key.startsWith(filterRels))

    Lits = literals.map((key, idx) => <Flex ml={2} key={idx}><Prop>{key}</Prop>{thing[key].map((x) => <Val value={x} />)}</Flex>)

    Rels = rels.map((pred, idx1) => {
      // let head = <Pred>{pred}</Pred>
      let items = thing[pred].map((id, idx2) => {
        const newPath = [...path, id]
        return <ThingC key={idx2} thing={things[id]} level={level + 1} path={newPath} predicate={pred} />
      })
      // return <li key={idx1}>{head}<Ul>{items}</Ul></li>
      return <Ul key={idx1}>{items}</Ul>
    })
  }

  const c = chroma.scale(['pink', 'grey'])
  // const bg = visible ? c(1 - 1 / (level * 0.7)) : 'transparent'
  const bg = c(1 - 1 / (level * 0.7)).brighten(level * 0.2)
  const Wrap = styled(Box)`
    background: ${bg};
    padding: 5px;
    cursor: pointer;
  `
  return (
    <Wrap p={1} ml={2} my={1} onClick={click}>
      {Head}
      {Lits}
      {Rels}
    </Wrap>
  )
}

const RootThingC = connect(mapStateToProps, mapDispatchToProps)(RootThing)
const ThingC = connect(mapStateToProps, mapDispatchToProps)(Thing)

export default RootThingC

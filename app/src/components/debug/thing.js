'use strict'
import React from 'react'
import { connect } from 'react-redux'
import { uiTree } from '../../actions'
// import posed, { PoseGroup } from 'react-pose'

import { isThing, isLiteral, fromRdfValue, getPropsFromTree } from '../../util'
// import styled from 'styled-components'
// import chroma from 'chroma-js'

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

const Token = ({children}) => <span className='text-red text-sm font-bold mr-1'>{children}</span>
const Prop = ({children}) => <span className='text-blue text-sm font-bold mr-1'>{children}</span>
const Id = ({children}) => <span className='text-grey text-sm mr-1'>{children}</span>
const Type = ({children}) => <span className='text-orange text-sm mr-1'>{children}</span>
const Value = ({children}) => <span className='text-grey-darker text-sm mr-1'>{children}</span>

const Val = ({value}) => {
  return <Value>{fromRdfValue(value)}</Value>
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

const Thing = ({ things, thing, level, predicate, path, tree, setUiTree, hostRef, style }) => {
  const click = (e) => {
    e.stopPropagation()
    setUiTree(path, {_show: !isVisible()})
  }

  const isVisible = () => {
    let props = getPropsFromTree(tree, path)
    return props && props._show
  }

  const visible = isVisible()

  if (!thing || !(typeof thing === 'object')) return '<div>CANNOT SHOW!</div>'
  let props = Object.keys(thing)
  const Head = <div className='flex'>{predicate ? <Pred>{predicate}</Pred> : ''}<Type>{thing.type}</Type><Id>{thing.id}</Id></div>
  let Lits = null
  let Rels = null

  if (visible) {
    props = props.filter((p) => ['id', 'type'].indexOf(p) === -1)
    // Todo: What about mixed props?
    let literals = props.filter((key) => isLiteral(thing[key][0]))
    let rels = props.filter((key) => isThing(thing[key][0]))

    // let filterRels = 'co:'
    // let filterRels = 'po:contains'
    // rels = rels.filter((key) => !key.startsWith(filterRels))

    Lits = literals.map((key, idx) => (
      <div className='ml-2 flex' key={idx}>
        <Prop>{key}</Prop>
        { thing[key].map((x, i) => <Val value={x} key={i} />) }
      </div>
    ))

    Rels = rels.reduce((items, pred) => {
      let add = thing[pred].map((id, idx2) => {
        return <ThingC key={pred + '/' + id} thing={things[id]} level={level + 1} path={[...path, id]} predicate={pred} />
      })
      return items.concat(add)
    }, [])
  }

  // const c = chroma.scale(['pink', 'grey'])
  // const bg = visible ? c(1 - 1 / (level * 0.7)) : 'transparent'
  // const bg = c(1 - 1 / (level * 0.7)).brighten(level * 0.2)
  const bg = '#fff'
  return (
    <div ref={hostRef} style={style}>
      <div className='p-1 ml-2 my-1' style={{background: bg}} onClick={click} ref={hostRef}>
        {Head}
        {Lits}
        {Rels}
      </div>
    </div>
  )
}

// const posedOpts = {
//   enter: { delayChildren: 500, height: 'auto', flip: true },
//   exit: { delay: 500, height: 0 }
// }
// const PosedThing = posed(Thing)(posedOpts)

const RootThingC = connect(mapStateToProps, mapDispatchToProps)(RootThing)
const ThingC = connect(mapStateToProps, mapDispatchToProps)(Thing)

export default RootThingC

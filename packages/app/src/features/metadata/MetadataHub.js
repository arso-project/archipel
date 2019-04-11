'use strict'
/*
Browse by metadata.
e.g. show all files with artist=freddy mercury or something.
*/
import React, { useEffect, useState, useReducer } from 'react'
import hubController from './hubController'
import { ListAndEditMetadata } from './MetadataEditor'
import { getAllKeysAndLabels, Categories } from './schemas'
import { MdExpandLess, MdExpandMore } from 'react-icons/md'
import { Button, DeleteIcon, TightInputForm } from '@archipel/ui'

let keysAndLabels = null

class Filter {
  constructor (attribute, assign) {
    this.active = true
    this.attributes = []
    if (attribute || assign) this.addAttribute(attribute, assign)
  }

  addAttribute (attribute, assign) {
    this.attributes.push({ attribute, assign })
  }

  delAttribute (attribute, assign) {
    let pos = this.attributes.findIndex(e => e.attribute === attribute && e.assign === assign)
    this.attributes.splice(pos, 1)
  }

  getAttributes (onDisplay) {
    if (!onDisplay && !this.active) return []
    return this.attributes
  }

  toggle () {
    this.active = !this.active
    return this.active
  }
}

function FilterEditor (props) {
  let { addFilter } = props
  let [filter, setFilter] = useState(new Filter())
  let [rerender, forceRerender] = useReducer(x => x + 1, 0)
  let [newAttribute, setNewAttribute] = useState(null)
  let [newAssign, setNewAssign] = useState(null)

  function addAttribute (attribute, assign) {
    filter.addAttribute(attribute, assign)
  }

  function delAttribute (attribute, assign) {
    filter.delAttribute(attribute, assign)
    forceRerender()
  }

  function onSubmit () {
    addAttribute(newAttribute, newAssign)
    setNewAssign(null)
  }

  function submitFilter () {
    addFilter(filter)
    setFilter(new Filter())
  }

  return (
    <div className='p-2 border border-grey flex flex-col'>
      {filter.getAttributes().map(
        (e, i) =>
          <div key={`filter@FilterEditor:${i}`} className='m-1 flex'>
            <span className='mr-1'>{keysAndLabels.labelFromKey(e.attribute)}: {e.assign}</span>
            <DeleteIcon size={14} onClick={() => delAttribute(e.attribute, e.assign)} />
          </div>
      )}
      <div className='flex flex-col'>
        <select className='mb-1 block w-full bg-white border border-grey rounded text-black p-1 leading-tight focus:outline-none focus:bg-white focus:border-grey'
          id='selectBox' selected={newAttribute}
          onChange={e => setNewAttribute(keysAndLabels.keyFromLabel(e.target.value))}>
          <option key='null-option' value={null}>--no attribute--</option>
          {keysAndLabels && keysAndLabels.labels.map(
            (label) => <option key={label} value={label}>{label}</option>
          )}
        </select>
        <TightInputForm className='mb-1 w-auto'
          value={newAssign}
          onChange={e => setNewAssign(e.target.value)}
          onSubmit={onSubmit}
          widthUnits={7}
          addForm />
        <Button onClick={submitFilter}>Create</Button>
      </div>
    </div>
  )
}

function FilterDisplay (props) {
  const { filter, deleteFilter, toggleFilter } = props
  let [active, setActive] = useState(filter.active)

  function toggle () {
    let { cb, index } = toggleFilter
    setActive(cb(index))
  }

  let color = active ? 'green-light' : 'red-light'
  return (
    <div className='flex flex-col border p-1 m-2'>
      <div className='inline-flex'>
        <div className={'flex-1 mr-4 h-4 rounded-full bg-' + color} onClick={toggle} />
        <DeleteIcon onClick={deleteFilter} />
      </div>
      {filter.getAttributes(true).map((e, i) =>
        <span key={`filter@FilterDisplay:${i}`} className='p-1'>{e.attribute}: {e.assign}</span>)}
    </div>
  )
}

function MetadataRecordCard (props) {
  const { metadata } = props
  const { ofCategory: category, ...restMeta } = metadata
  if (!category) return null

  let [expanded, setExpand] = useState(false)
  let height = ''
  if (!expanded) height = ' max-h-64'
  return <div className='border border-pink shadow-md flex flex-col p-2 m-2'>
    <h3 className='text-right'>{category && Categories.getLabel(Object.keys(category.values)[0])}</h3>
    <div className={'flex flex-col items-stretch overflow-hidden w-64 mb-2' + height}>
      <ListAndEditMetadata metadata={restMeta} />
    </div>
    <button onClick={() => setExpand(!expanded)}
      className='bg-grey-lighter border border-pink-lighter rounded'>
      {expanded ? <MdExpandLess /> : <MdExpandMore />}
    </button>
  </div>
}

export default function MetadataHub (props) {
  let [metadata, setMetadata] = useState(null)
  let [filterList, setFilterList] = useState([])
  let [limit, setLimit] = useState(hubController.limit())

  useEffect(() => {
    hubController.setArchive(props.params.archive)
    keysAndLabels = getAllKeysAndLabels()
  }, [props])

  useEffect(() => {
    updateMetadata()
  }, [filterList])

  async function updateMetadata () {
    let res = await hubController.search(filterList)
    setMetadata(res)
  }

  function appendFilter (filter) {
    let list = [...filterList]
    list.push(filter)
    setFilterList(list)
  }

  function deleteFilter (index) {
    let list = [...filterList]
    list.splice(index, 1)
    setFilterList(list)
  }

  function toggleFilter (index) {
    let list = [...filterList]
    let filterState = list[index].toggle()
    setFilterList(list)
    return filterState
  }

  function adjustLimit (e) {
    let limit = e.target.value
    setLimit(limit)
    hubController.limit(limit)
  }

  return (
    <div className='flex flex-col'>
      {/* 1st row: topbar */}
      <div className='flex-1 border border-pink flex-col'>
        <span className='m-1'>Filter:</span>
        <div className='flex'>
          <div className='h-24' />
          {filterList.map((e, i) => <div key={`filerList@MetadataHub:${i}`}>
            <FilterDisplay filter={e} deleteFilter={() => deleteFilter(i)} toggleFilter={{ cb: toggleFilter, index: i }} />
          </div>)}
        </div>
      </div>
      {/* 2nd row */}
      <div className='flex-1 flex flex-row border-pink'>
        {/* 2nd row, 1st column: left sidebar */}
        <div className='w-64 border border-pink flex flex-col p-2'>
          <label className='mb-1' htmlFor='putInLimit'>Result limit:</label>
          <input className='mb-1 p-1 border border-grey w-16' id='putInLimit' type='number' value={limit} min={1} onChange={adjustLimit} />
          <span className='mb-1'>Define new filter:</span>
          <div>
            <FilterEditor addFilter={appendFilter} />
          </div>
        </div>
        {/* 2nd row, 2nd column: main-body */}
        <div className='min-h-screen flex-1 border border-pink flex flex-wrap p-2'>
          {metadata && metadata.map((e, i) => <MetadataRecordCard key={`metadata@MetadataRecordCard:${i}`} metadata={e} />)}
        </div>
      </div>
    </div>
  )
}

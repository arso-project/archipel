'use strict'
/*
Browse by metadata.
e.g. show all files with artist=freddy mercury or something.
*/
import React, { useEffect, useState } from 'react'
import hubController from './hubController'
import { ListAndEditMetadata } from './MetadataEditor'
import { metadataToMetadata } from './util'
import { getAllKeysAndLabels, Categories } from './schemas'
import { MdExpandLess, MdExpandMore } from 'react-icons/md'
import { Button, DeleteIcon, TightInputForm } from '@archipel/ui'

let keysAndLabels = null

function MetadataRecordCard (props) {
  const { metadata } = props
  console.log('MRC', metadata)
  const { ofCategory: category, ...restMeta } = metadata
  console.log('MRC', category)
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
  console.log('MH props:', props)

  let [metadata, setMetadata] = useState(null)
  let [filterList, setFilterList] = useState([])

  useEffect(() => {
    hubController.setArchive(props.params.archive)
    keysAndLabels = getAllKeysAndLabels()
    console.log('MH useEffect', keysAndLabels)
  }, [props])

  console.log('MH', keysAndLabels)

  async function queryCategory (category) {
    console.log('MHqueryCategory0', category)
    await setMetadata(await hubController.queryCategory(category))
    console.log('MHqueryCategory1', metadata)
  }

  async function queryPredicate (predicate) {
    console.log(predicate)
    predicate = keysAndLabels.keyFromLabel(predicate)
    console.log(predicate)
    let res = await hubController.queryPredicate(predicate)
    console.log('query', res)
    setMetadata(res)
  }

  function appendFilter (filter) {
    let list = [...filterList]
    list.push(filter)
    setFilterList(list)
    console.log(filterList)
  }

  console.log(hubController.getPossibleFilters())
  console.log('MH metadata', metadata)
  console.log('MH filterList', filterList)
  return (
    <div className='flex flex-col'>
      <div className='h-64 flex-1 border border-pink'>
        <span className='w-64 break-normal'>
          Here will be visibile which filters are active 
          and it will be possible to deactivate/remove them
        </span>
        {filterList.map(e =>
          <div><FilterDisplay filter={e} /></div>)}
      </div>
      <div className='flex-1 flex flex-row border-pink'>
        <div className='w-64 border border-pink'>
          <span className='break-normal'>
            Here it will be possible to define filters
          </span>
          <div>
            <span className='font-bold'>Categories</span>
            <ul className='list-reset'>
              {hubController.categories().map(
                (elem) => <li key={`hub/selectCategory/${elem}`} className='pl-1' onClick={() => queryCategory(elem)}>{elem}</li>
              )}
            </ul>
            <span className='font-bold'>Filter by Entry</span>
            <ul className='list-reset'>
              {keysAndLabels && keysAndLabels.labels.map(
                (elem) => <li key={`hub/selectLabel/${elem}`} className='pl-1' onClick={() => queryPredicate(elem)}>{elem}</li>
              )}
            </ul>
            {/* <form className='flex flex-col'>
              <select id='selectBox' onChange={e => setFilter({ ...filter, entryType: keysAndLabels.keyFromLabel(e.target.value) })}>
                {keysAndLabels && keysAndLabels.labels.map(
                  (label) => <option value={label}>{label}</option>
                )}
              </select>
              <input type='text' onChange={e => setFilter({ ...filter, text: e.target.value })} />
            </form>
            {JSON.stringify(filter)} */}
            <FilterEditor addFilter={appendFilter} />
          </div>
        </div>
        <div className='flex-1 border border-pink flex flex-wrap p-2'>
          {metadata && metadata.map(elem => <MetadataRecordCard metadata={elem} />)}
        </div>
      </div>
    </div>
  )
}

function FilterEditor (props) {
  let { addFilter } = props
  let [filter, setFilter] = useState(new Filter())
  let [newAttribute, setNewAttribute] = useState('select Attribute')
  let [newAssign, setNewAssign] = useState(null)

  function addAttribute (attribute, assign) {
    console.log(filter)
    filter.addAttribute(attribute, assign)
    console.log(filter)
    setFilter(filter)
    console.log(filter)
  }

  function delAttribute (attribute, assign) {
    console.log(filter)
    filter.delAttribute(attribute, assign)
    console.log(filter)
    setFilter(filter)
    console.log(filter)
  }

  function onSubmit () {
    addAttribute(newAttribute, newAssign)
    setNewAttribute('select Attribute')
    setNewAssign(null)
  }

  return (
    <div className='m-1 p-1 border border-grey flex flex-col'>
      {filter.getAttributes().map(
        e =>
          <div className='flex'>
            <span className='mr-1'>{keysAndLabels.labelFromKey(e.attribute)}: {e.assign}</span>
            <DeleteIcon size={14} onClick={() => delAttribute(e.attribute, e.assign)} />
          </div>
      )}
      <div className='flex flex-col'>
        <select id='selectBox' onChange={e => setNewAttribute(keysAndLabels.keyFromLabel(e.target.value))}>
          {keysAndLabels && keysAndLabels.labels.map(
            (label) => <option key={label} value={label}>{label}</option>
          )}
        </select>
        <TightInputForm className='w-auto'
          value={newAssign}
          onChange={e => setNewAssign(e.target.value)}
          onSubmit={onSubmit}
          widthUnits={7}
          addForm />
        <Button onClick={() => addFilter(filter)}>Create</Button>
      </div>
    </div>
  )
}

function FilterDisplay (props) {
  const { filter } = props

  return (
    <div className='flex flex-col'>
      {filter.getAttributes().map(e =>
        <div className='m-1 inline-flex'>
          <span>{e.attribute}: {e.assign}</span>
        </div>)}
    </div>
  )
}

class Filter {
  constructor (attribute, assign) {
    this.attributes = []
    if (attribute || assign) this.addAttribute(attribute, assign)
  }

  addAttribute (attribute, assign) {
    this.attributes.push({ attribute, assign })
  }

  delAttribute (attribute, assign) {
    console.log(attribute, assign)
    let pos = this.attributes.findIndex(e => e.attribute === attribute && e.assign === assign)
    console.log(pos)
    this.attributes.splice(pos, 1)
  }

  getAttributes () {
    return this.attributes
  }
}

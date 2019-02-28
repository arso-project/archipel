import React from 'react'
// Todo: Remove ucore.
import { useArchiveStats } from './netStatsStore'
import { MdRepeat, MdArrowDownward, MdArrowUpward, MdFileDownload, MdFileUpload } from 'react-icons/md'

function NetStats (props) {
  let { archive } = props
  if (!archive) return null
  const stats = useArchiveStats(archive)
  if (!stats) return null

  function sum (stats) {
    let sum = Object.values(stats).reduce((acc, val) => {
      // makes max of peers sense? or sum? or min > 0?
      acc.peers = val.peers > acc.pee ? val.peers : acc.peers
      acc.upSpeed += val.upSpeed
      acc.downSpeed += val.downSpeed
      acc.upTotal += val.upTotal
      acc.downTotal += val.downTotal
      return acc
    })
    return sum
  }

  let { peers, downSpeed, upSpeed, downTotal, upTotal } = sum(stats)

  downSpeed = sizeUnits(downSpeed, 'speed')
  upSpeed = sizeUnits(upSpeed, 'speed')
  downTotal = sizeUnits(downTotal, 'amount')
  upTotal = sizeUnits(upTotal, 'amount')
  return (
    <div className='flex'>
      <div className='inline-flex p-2' >
        <div className='flex-none -mb-2'><MdRepeat /></div>
        <span className='self-center'>{peers}</span>
      </div>
      <div className='p-2' ><MdArrowDownward />{downSpeed}</div>
      <div className='p-2' ><MdArrowUpward />{upSpeed}</div>
      <div className='p-2' ><MdFileDownload />{downTotal}</div>
      <div className='p-2' ><MdFileUpload />{upTotal}</div>
    </div>
  )
}

function sizeUnits (data, type) {
  let unit
  switch (type) {
    case ('amount'):
      unit = ''
      break
    case ('speed'):
      unit = '/s'
      break
    default: unit = ''
  }

  switch (true) {
    case (data === 0):
      return `0 B` + unit
    case (data >= 0 && data < 1e3):
      return `${data.toFixed(1)}\u2009B` + unit
    case (data >= 1e3 && data < 1e6):
      data = data / 1e3
      return `${data.toFixed(1)}\u2009kB` + unit
    case (data >= 1e6 && data < 1e9):
      data = data / 1e6
      return `${data.toFixed(1)}\u2009MB` + unit
    case (data >= 1e9 && data < 1e12):
      data = data / 1e9
      return `${data.toFixed(1)}\u2009GB` + unit
    case (data >= 1e12 && data < 1e15):
      data = data / 1e12
      return `${data.toFixed(1)}\u2009TB` + unit
    default: return `${data} B` + unit
  }
}

export default NetStats

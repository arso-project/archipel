import React from 'react'
// Todo: Remove ucore.
import { Consumer } from 'ucore/react'
import { MdRepeat, MdArrowDownward, MdArrowUpward, MdFileDownload, MdFileUpload } from 'react-icons/md'

const NetStats = () => {
  return <Consumer className='p-2' store='archive' select={'getNetworkStats'}>
    {(netStats) => {
      if (!netStats) {
        return null
      }

      let { peers, downSpeed, upSpeed, downTotal, upTotal } = netStats
      downSpeed = sizeUnits(downSpeed, 'speed')
      upSpeed = sizeUnits(upSpeed, 'speed')
      downTotal = sizeUnits(downTotal, 'amount')
      upTotal = sizeUnits(upTotal, 'amount')
      return (
        <span>
          <span className='p-2' ><MdRepeat />{peers}</span>
          <span className='p-2' ><MdArrowDownward />{downSpeed}</span>
          <span className='p-2' ><MdArrowUpward />{upSpeed}</span>
          <span className='p-2' ><MdFileDownload />{downTotal}</span>
          <span className='p-2' ><MdFileUpload />{upTotal}</span>
        </span>
      )
    } }
  </Consumer>
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

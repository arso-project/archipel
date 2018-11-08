import React from 'react'
import { Consumer } from 'ucore/react'
import { MdArrowDownward, MdArrowUpward, MdFileDownload, MdFileUpload } from 'react-icons/md'

const NetStats = () => {
  return <Consumer className='p-2' store='archive' select={'getNetworkStats'}>
    {(netStats, { loadNetworkStats }) => {
      if (!netStats) {
        return null
      }

      let { peers, downSpeed, upSpeed, downTotal, upTotal } = netStats
      return (
        <span>
          Peers: {peers}
          <MdArrowDownward />{downSpeed}
          <MdArrowUpward />{upSpeed}
          <MdFileDownload />{downTotal}
          <MdFileUpload />{upTotal}
        </span>
      )
    } }
  </Consumer>
}

export default NetStats

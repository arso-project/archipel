import React from 'react'
import { cls } from '../util.js'
import { Button } from '../'

import './PDFViewControl.pcss'

const PDFViewControl = (props) => {
  let { onPageChange, onPageUp, onPageDown, pageNum, numPages, ...rest } = props
  return (
    <div {...rest} className={cls(rest, 'ctrl')}>
      <Button onClick={onPageDown}> &lt; </Button>
      <input type='number'
        min='0' max={numPages} value={pageNum}
        onChange={onPageChange}
      />
      <span>/{numPages}</span>
      <Button onClick={onPageUp}> &gt; </Button>
    </div>
  )
}

export default PDFViewControl

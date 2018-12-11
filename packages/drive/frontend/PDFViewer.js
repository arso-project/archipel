'use strict'

import React from 'react'
import ReactDOM from 'react-dom'
import PDFjs from 'pdfjs-dist'
// IMPORTANT: node_modules/pdfjs-dist/build/pdf.worker.js needs to be simlinked
// to the localhost:8080 basefolder. At the time of writing this, it was
// packages/app/dist/
PDFjs.GlobalWorkerOptions.workerSrc = './pdf.worker.js'

export class PDFViewer extends React.Component {
  constructor (props) {
    super(props)
    this.loadPDF = this.loadPDF.bind(this)
  }

  componentDidMount () {
    this.loadPDF()
  }

  componentDidUpdate () {
    this.loadPDF()
  }

  loadPDF () {
    let node = ReactDOM.findDOMNode(this).getElementsByClassName('PDF-V-ID')[0]

    node.innerHTML = ''

    node.style.width = '100%'
    node.style.height = '100%'
    node.style.overflowX = 'hidden'
    node.style.overflowY = 'scroll'
    node.style.padding = '0px'

    PDFjs.getDocument({ data: this.props.content }).then((pdf) => {
      if (pdf.numPages === 1) node.style.overflowY = 'hidden'

      let id = 1
      for (let i = 1; i <= pdf.numPages; i++) {
        pdf.getPage(i).then((page) => {
          let boxWidth = node.clientWidth
          let pdfWidth = page.getViewport(1).width
          let scale = boxWidth / pdfWidth
          let viewport = page.getViewport(scale)

          let canvas = document.createElement('canvas')
          canvas.id = 'page-' + id
          id++
          canvas.width = viewport.width
          canvas.height = viewport.height
          node.appendChild(canvas)

          let context = canvas.getContext('2d')
          let renderContext = {
            canvasContext: context,
            viewport: viewport
          }
          page.render(renderContext)
        })
      }
    })
  }

  render () {
    return (
      <div className='PDFViewer'>
        <div className='PDF-V-ID'></div>
      </div>
    )
  }
}

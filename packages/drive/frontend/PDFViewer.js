'use strict'

// Inspired by: https://github.com/javascriptiscoolpl/npm-simple-react-pdf/blob/master/src/index.js
import React from 'react'
// import ReactDOM from 'react-dom'
import { PDFViewControl } from '@archipel/ui'

import PDFjs from 'pdfjs-dist'
// IMPORTANT: node_modules/pdfjs-dist/build/pdf.worker.js needs to be simlinked
// to the localhost:8080 basefolder. At the time of writing this, it was
// packages/app/dist/
PDFjs.GlobalWorkerOptions.workerSrc = './pdf.worker.js'

export class PDFViewer extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      pdf: null,
      numPages: 0,
      pageNum: 1
    }

    this.littlePageNum = this.props.littlePageNum || 3
    this.pdfRef = React.createRef()

    this.loadPDF = this.loadPDF.bind(this)
    this.loadPage = this.loadPage.bind(this)
    this.loadLittlePages = this.loadLittlePages.bind(this)
  }

  componentDidMount () {
    this.loadPDF()
  }

  componentDidUpdate () {
    this.loadPage()
  }

  onChangePage (e) {
    this.setState({ pageNum: e.target.value })
    this.loadPage()
  }

  loadPDF () {
    // get node for this react component
    let node = this.pdfRef.current

    // clean for update
    // node.innerHTML = ''

    // set styles
    node.style.width = '100%'
    node.style.overflowX = 'hidden'

    PDFjs.getDocument({ data: this.props.content }).then((pdf) => {
      if (pdf.numPages <= this.littlePageNum) {
        node.style.height = 'container'
        node.style.overflowY = 'scroll'
      } else {
        node.style.height = '100%'
        node.style.overflowY = 'hidden'
      }
      this.setState({ node: node, pdf: pdf, numPages: pdf.numPages, pageNum: 1 })
      if (pdf.numPages <= this.littlePageNum) {
        this.loadLittlePages()
      } else {
        this.loadPage()
      }
    })
  }

  loadPage () {
    let { node, pdf, pageNum } = this.state

    pdf.getPage(Number(pageNum)).then((page) => {
      let { viewport, canvas } = this.getViewportAndCanvas(node, page, pageNum)

      node.childNodes[0] ? node.replaceChild(canvas, node.childNodes[0]) : node.appendChild(canvas)

      // get context and render page
      let renderContext = {
        canvasContext: canvas.getContext('2d'),
        viewport: viewport
      }
      page.render(renderContext)
    }).catch((err) => console.log(err))
  }

  loadLittlePages () {
    let { node, pdf, numPages } = this.state

    for (let i = 1; i <= numPages; i++) {
      pdf.getPage(i).then((page) => {
        let { viewport, canvas } = this.getViewportAndCanvas(node, page, i)

        node.appendChild(canvas)

        // get context and render page
        let renderContext = {
          canvasContext: canvas.getContext('2d'),
          viewport: viewport
        }
        page.render(renderContext)
      })
    }
  }

  getViewportAndCanvas (node, page, pageNum) {
    // calculate scale according to the box size
    let boxWidth = node.clientWidth
    let pdfWidth = page.getViewport(1).width
    let scale = boxWidth / pdfWidth // * 0.3
    let viewport = page.getViewport(scale)

    // set canvas for page
    let canvas = document.createElement('canvas')
    canvas.id = 'page-' + pageNum
    canvas.width = viewport.width
    canvas.height = viewport.height

    return { viewport, canvas }
  }

  render () {
    let { pageNum, numPages } = this.state
    return (
      <div>
        {
          (numPages > this.littlePageNum)
            ? <PDFViewControl
              onPageChange={(e) => this.onChangePage(e)}
              onPageDown={() => this.setState({ pageNum: --pageNum })}
              onPageUp={() => this.setState({ pageNum: ++pageNum })}
              pageNum={pageNum}
              numPages={numPages} />
            : ''
        }
        <div ref={this.pdfRef} className='h-screen w-full' />
      </div>
    )
  }
}

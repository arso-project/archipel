'use strict'

// TODO: Discard PDF at newload

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
      pdf: null
    }
    this.loadingTask = null
    this.loadPDF = this.loadPDF.bind(this)
  }

  componentDidMount () {
    console.log('PDF/mount')
    this.loadPDF()
  }

  componentDidUpdate (prevProps, prevState) {
    if (!this.state.pdf) return
    if (prevProps.content !== this.props.content) {
      this.state.pdf.destroy()
      this.loadPDF()
    }
    if (prevState.pdf) prevState.pdf.destroy()
  }

  componentWillUnmount () {
    this.isUnmounting = true
    if (this.state.pdf) this.state.pdf.destroy()
  }

  loadPDF () {
    console.log('PDF/update')
    this.loadingTask = PDFjs.getDocument({ data: this.props.content }).then((pdf) => {
      if (this.isUnmounting) return
      this.setState({ pdf })
    })
  }

  render () {
    let { pdf } = this.state
    if (pdf && !this.isUnmounting) {
      return (
        <PDFPageViewer pdf={pdf} numPages={pdf.numPages} littlePageNum={this.littlePageNum || 3} />
      )
    }
    return (
      <span> Loading... </span>
    )
  }
}

class PDFPageViewer extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      pageNum: 1
    }
    this.pdfRef = React.createRef()
    this.loadPage = this.loadPage.bind(this)
    this.loadLittlePages = this.loadLittlePages.bind(this)
  }

  componentDidMount () {
    console.log('innerMount/pdf', this.props.pdf)
    const { numPages, littlePageNum } = this.props
    if (numPages <= littlePageNum) {
      this.loadLittlePages()
    } else {
      this.loadPage()
    }
  }

  componentDidUpdate () {
    console.log('innerUpdate')
    const { numPages, littlePageNum } = this.props
    if (numPages <= littlePageNum) {
      this.loadLittlePages()
    } else {
      this.loadPage()
    }
  }

  onChangePage (e) {
    this.setState({ pageNum: Number(e.target.value) })
    this.loadPage()
  }

  loadNode () {
    const { numPages, littlePageNum } = this.props
    // get node for this react component
    let node = this.pdfRef.current

    // set styles
    node.style.width = '100%'
    node.style.overflowX = 'hidden'

    if (numPages <= littlePageNum) {
      node.style.height = 'container'
      node.style.overflowY = 'scroll'
    } else {
      node.style.height = '100%'
      node.style.overflowY = 'hidden'
    }
  }

  loadPage () {
    const { pdf } = this.props
    let { pageNum } = this.state
    this.loadNode()
    let node = this.pdfRef.current

    pdf.getPage(Number(pageNum)).then((page) => {
      console.log('page', page)
      let { viewport, canvas } = this.getViewportAndCanvas(page, pageNum)

      while (node.firstChild) {
        node.removeChild(node.firstChild)
      }
      node.appendChild(canvas)

      // get context and render page
      let renderContext = {
        canvasContext: canvas.getContext('2d'),
        viewport: viewport
      }
      page.render(renderContext)
    }).catch((err) => console.log(err))
  }

  loadLittlePages () {
    let { pdf, numPages } = this.props
    let node = this.pdfRef.current

    while (node.firstChild) {
      node.removeChild(node.firstChild)
    }

    for (let i = 1; i <= numPages; i++) {
      pdf.getPage(i).then((page) => {
        let { viewport, canvas } = this.getViewportAndCanvas(page, i)

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

  getViewportAndCanvas (page, pageIndex) {
    let node = this.pdfRef.current
    // calculate scale according to the box size
    let boxWidth = node.clientWidth
    let pdfWidth = page.getViewport(1).width
    let scale = boxWidth / pdfWidth // * 0.3
    let viewport = page.getViewport(scale)

    // set canvas for page
    let canvas = document.createElement('canvas')
    canvas.id = 'page-' + pageIndex
    canvas.width = viewport.width
    canvas.height = viewport.height

    return { viewport, canvas }
  }

  render () {
    let { numPages, littlePageNum } = this.props
    let { pageNum } = this.state
    console.log('rerendered')
    return (
      <div>
        {
          (numPages > littlePageNum)
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

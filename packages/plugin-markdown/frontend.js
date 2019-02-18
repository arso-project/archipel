import React from 'react'
import remark from 'remark'
import reactRenderer from 'remark-react'

import './github-markdown.css'

export default {
  name: 'markdown',
  plugin
}

async function plugin (core) {
  core.components.add('fileViewer', MarkdownViewer, {
    stream: false,
    format: 'utf-8',
    match: (file) => {
      return file.name.match(/\.md$/)
    }
  })
}

class MarkdownViewer extends React.Component {
  render () {
    const { content } = this.props
    return (
      <div className='markdown-body'>
        {remark().use(reactRenderer).processSync(content).contents}
      </div>
    )
  }
}

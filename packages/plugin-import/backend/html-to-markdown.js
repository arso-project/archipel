var unified = require('unified')
// var createStream = require('unified-stream')
var parse = require('rehype-parse')
var rehype2remark = require('rehype-remark')
var stringify = require('remark-stringify')

module.exports = function htmlToMarkdown (html) {
  const processor = unified()
    .use(parse)
    .use(rehype2remark)
    .use(stringify)
  return processor.processSync(html).toString()
}

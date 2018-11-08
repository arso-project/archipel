
const TreeItem = (props) => {
  let { content, children, icon, color, nodes, fetchNodes } = props
  content = content || children
  if (fetchNodes) nodes = fetchNodes(props)
}

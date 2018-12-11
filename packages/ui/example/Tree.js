// TODO: Write new Tree example.

// import React from 'react'
// import TreePanel, { setAndCopy, walkTree } from '../src/components/Tree'

// const nodes = [
//   {
//     id: 'first',
//     title: 'foo'
//   },
//   {
//     id: 'second',
//     title: 'BAR!',
//     items: [
//       {
//         id: 'baz',
//         title: 'boo'
//       },
//       {
//         id: 'bazz',
//         title: 'booo'
//       }
//     ]
//   },
//   {
//     id: 'oi',
//     title: 'oioioi!',
//     fetchChildren: makeFetchNodes('OICHILD')
//   }
// ]

// let tree = {
//   nodes,
//   id: 'root',
//   title: 'root'
// }

// function toObject (tree) {
//   return tree.reduce((obj, node) => {
//     if (node.nodes) node.nodes = toObject(node.nodes)
//     obj[node.id] = node
//     return obj
//   }, {})
// }

// function makeFetchNodes (prefix) {
//   return fetchNodes
//   async function fetchNodes (item, path) {
//     let cnt = Math.floor(Math.random() * 10)
//     let nodes = []
//     let i = 0
//     while (nodes.length < cnt) {
//       i++
//       nodes.push({ id: prefix + '-' + i, title: prefix + ':' + i + ':' + item.title + ' / ' + cnt })
//     }
//     return nodes
//     // return toObject(nodes)
//     // let nodeObj = toObject(nodes)
//     // let newTree = setAndCopy(tree, path, { nodes: nodeObj })
//     // return newTree
//   }
// }

// const Wrapper = ({ children }) => <div className='flex'>{children}</div>
// const Node = ({ children, node }) => (
//   <div className={'p-2 ' + (node.id === 'first' ? 'border border-red' : '')}>{children}</div>
// )

// function makeNodes (base, lvl) {
//   lvl = lvl || 1
//   let list = words()
//   let num = Math.floor(Math.random() * 5)
//   let i = 0
//   let nodes = {}
//   for (i; i <= num; i++) {
//     let title = lvl + '.' + list[Math.floor(Math.random() * (list.length - 1))]
//     let id = title.toLowerCase().replace(/[^A-Za-z0-9]/g, '').substring(0, 8)
//     let node = {
//       id,
//       title
//     }
//     if (lvl < 5 && Math.random() > 0.3) {
//       node.items = makeNodes(base + '/' + id, lvl + 1)
//     }
//     nodes[id] = node
//   }
//   return nodes
// }

// let nodes2 = makeNodes('root')

// const TreeHeader = (props) => {
//   const { node, selected, zoom, zoomOut } = props

//   return (
//     <div>
//       <h3>{node.title}</h3>
//       { zoom && <button onClick={e => zoomOut()}>BACK</button>}
//       { selected && <div>Selected: <em>{selected.title}</em></div> }
//     </div>
//   )
// }
// const TreeView = () => {
//   return (
//     <TreePanel
//       nodes={nodes2}
//       childProp='items'
//       header={TreeHeader}
//       // fetchChildren={makeFetchNodes('root')}
//       keyboardFocus
//       title={'Tree test!'}
//       Wrapper={Wrapper}
//       Node={Node}
//     >
//       {({ node, state, action, Tree, Debug }) => (
//         // <div className={state.focus ? 'bg-grey-light' : ''}>
//         <div>
//           <div onClick={action('expand')} className={state.focus ? 'bg-yellow' : ''}>
//             {node.title}
//           </div>
//           <Tree />
//           <Debug />
//           {/* <Tree
//             // Wrapper={({ children }) => <div className='bg-blue-light'>{children}</div>} 
//             // Node={Node}
//           /> */}
//         </div>
//       )}
//     </TreePanel>
//   )
// }

// export default TreeView

// function words () {
//   return [
//     'Catchy Words',
//     'Amazing  ',
//     'Exclusive',
//     'Absolutely Lowest  ',
//     'Expert',
//     'Accordingly  ',
//     'Exploit',
//     'Advice  ',
//     'Extra',
//     'Alert Famous  ',
//     'Extraordinary',
//     'Amazing  ',
//     'Fascinating',
//     'Anniversary  ',
//     'First',
//     'Announcing  ',
//     'Focus',
//     'Anonymous  ',
//     'Fortune',
//     'Adorable  ',
//     'Free',
//     'Approved  ',
//     'Full',
//     'As a result  ',
//     'Fundamentals',
//     'Astonishing  ',
//     'Genuine',
//     'Attractive  ',
//     'Gigantic',
//     'Authentic  ',
//     'Greatest',
//     'Backed  ',
//     'Growth',
//     'Bargain  ',
//     'Guarantee',
//     'Basic  ',
//     'Guaranteed',
//     'Beautiful  ',
//     'Help',
//     'Because  ',
//     'Helpful',
//     'Best  ',
//     'HighTech',
//     'Best-selling  ',
//     'Highest',
//     'Better  ',
//     'Hot',
//     'Big  ',
//     'Hot Special',
//     'Bonanza  ',
//     'How To',
//     'Bonus  ',
//     'Huge Gift',
//     'Bottom Line  ',
//     'Hurry',
//     'Breakthrough  ',
//     'Imagination',
//     'Bargain  ',
//     'Immediately',
//     'Cancel Anytime  ',
//     'Important',
//     'Caused by  ',
//     'Improve',
//     'Certified  ',
//     'Improved',
//     'Challenge  ',
//     'Improvement',
//     'Colorful  ',
//     'Increase',
//     'Colossal  ',
//     'It\'s Here',
//     'Come along  ',
//     'Informative',
//     'Compare  ',
//     'Innovative',
//     'Competitive  ',
//     'Insider',
//     'Complete  ',
//     'Inspires',
//     'Compromise  ',
//     'Instructive',
//     'Confidential  ',
//     'Interesting',
//     'Consequently  ',
//     'Introducing',
//     'Crammed  ',
//     'Ironclad',
//     'Daring  ',
//     'Join',
//     'Delighted  ',
//     'Just Arrived',
//     'Delivered  ',
//     'Largest',
//     'Destiny  ',
//     'Last Chance',
//     'Direct  ',
//     'Last Minute',
//     'Discount  ',
//     'Latest',
//     'Discover  ',
//     'Launching',
//     'Download  ',
//     'Lavishly',
//     'Due to  ',
//     'Learn',
//     'Easily  ',
//     'Liberal',
//     'Easy  ',
//     'Lifetime',
//     'Edge  ',
//     'Limited',
//     'Emerging  ',
//     'Love',
//     'Endorsed  ',
//     'Luxury',
//     'Energy  ',
//     'Mainstream',
//     'Enormous  ',
//     'Miracle',
//     'Excellent  ',
//     'Money',
//     'Exciting  ',
//     'Money back'
//   ]
// }

import React, { useState, useContext, useEffect, useRef } from 'react'
// import { Heading } from '@archipel/ui'
import { useToggle } from '../lib/hooks'

const StackContext = React.createContext({})

function useStackRoot (init) {
  const [stack, _setStack] = useState([])
  const state = useRef({ next: [] })
  function setStack (fn) {
    _setStack(stack => {
      let newStack = fn(stack)
      console.log('stack', stack)
      return newStack
    })
  }

  function renderElement (el, key, wrap) {
    if (!el) return null
    let { Component, props, name } = el 

    if (!wrap) props.key = key

    let rendered = <Component {...props} />
    if (!wrap) return rendered
    else return wrap(rendered, key)
  }

  const api = {
    push (el) {
      setStack(stack => {
        el.props.stackPos = stack.length
        // el.props.next = state.current.next.shift()
        return [...stack, el]
      })
    },

    replaceOrInsert (pos, el) {
      setStack(stack => {
        // console.log('repl', stack, pos, el)
        el.props.stackPos = pos + 1
        // el.props.next = state.current.next.shift()
        if (stack[pos]) return stack.slice(0, pos + 1).concat([el])
        return [...stack, el]
      })
    },

    init (root, next) {
      let rootNext
      // if (next) rootNext = next.shift()
      this.push({ ...root, next: rootNext })
      // state.current.next = next ? next : []
      // console.log('init done', state.current.next)
    },

    toPath () {
      return stack.map(item => {
        if (item.toPath) return item.toPath(item.props)
        else return item.name
      }).join('/')
    },

    gotoPos (i) {
      setStack(stack => stack.slice(0, i + 1))
    },

    renderPos (pos, skipKey) {
      let el = stack[pos]
      return renderElement(el, pos)
    },

    renderAll (wrap) {
      if (!wrap) wrap = el => el
      let els = []
      let stop = false
      stack.forEach((el, i) => {
        if (el.inParent) stop = true
        if (el.inMain) stop = false
        if (stop) return
        els.push(renderElement(el, i, wrap))
      })
      return els
    },

    renderBelow (start, wrap) {
      let els = []
      let stop = false
      stack.slice(start + 1).forEach((el, i) => {
        if (el.inMain) stop = true
        if (stop) return
        els.push(renderElement(el, i, wrap))
      })
      return els
    },

    renderBreadcrumb () {
      return (
        <div className='flex'>
          {stack.map((item, i) => <BreadcrumbItem item={item} key={i} onGoto={this.gotoPos.bind(this, i)} />)}
        </div>
      )
    },

    length: stack.length,

    stack,

    StackWrapper (props) {
      const { children } = props
      return (
        <StackContext.Provider value={this}>
          {children}
        </StackContext.Provider>
      )
    }
  }

  useEffect(() => {
    if (init) init(api)
  }, [])

  return api
}

function BreadcrumbItem (props) {
  let { item, onGoto, i } = props
  // let [show, setShow] = useState(false)
	let name
	if (item.toPath) name = item.toPath(item.props)
	else name = item.name
	// let cls = 'mx-2 p-1 rounded bg-teal-light text-teal-darkest cursor-pointer hover:bg-teal relative'
  let cls = 'font-bold px-2 cursor-pointer'

  // let C = item.Component
  // let List = () => <C {...item.props} mode='list' render={renderList} />

  // function renderList (items, onSelect) {
    // return (
      // <div className='absolute pin-t pin-b' style={{top: '20px'}}>
        // <div className='bg-teal-lightest p-2 rounded'>
          // {items.map((item, key) => <div key={key} onClick={e => onSelect(item)}>{item.name}</div>)}
        // </div>
      // </div>
    // )
  // }
        // {show && <List />}

  // let onClick = e => onGoto(i)
  let onShow = e => setShow(show => !show)
  return (
    <>
      <div className={cls} onClick={e => onGoto()}>
        {name}
      </div>
      <div className='text-red'>/</div>
    </>
  )
}

function useStack (props) {
  props = props || {}
  const stack = useContext(StackContext)
  const build = { ...stack}
  if (props.stackPos !== undefined) {
    let pos = props.stackPos
    build.afterMe = stack.replaceOrInsert.bind(stack, pos)
    build.renderBelow = stack.renderBelow.bind(stack, pos)
    build.node = stack.stack[pos]
    build.onClick = el => e => {
      if (e.shiftKey) el.inParent = true
      build.afterMe(el)
    }
  }
  return build
}

function Stack (props) {
  const { children, init } = props
  const stack = useStackRoot(init)
  return (
    <StackContext.Provider value={stack}>
      {children}
    </StackContext.Provider>
  )
}

const ARCHIVES = [
  { key: 'first', name: 'First' },
  { key: 'second', name: 'Second' },
]

const PATH = 'archives/first'

function Root (props) {
  function init (stack) {
    // stack.push({
      // Component: ArchiveList,
      // name: 'archives',
      // props: { archives: ARCHIVES },
      // next: 'first'
    // })
    stack.init({
      Component: ArchiveList,
      name: 'archives',
      props: { archives: ARCHIVES },
    }, ['first', 'item-0', 'item-1'])
  }
  return (
    <div>
      <Stack init={init}>
        <Detached />
        <Wrapper />
      </Stack>
    </div>
  )
}

function Detached (props) {
  const [name, setName] = useState('')
  const stack = useStack()
  const item = {
    Component: (props) => 'Hello, !' + props.title,
    props: { title: name },
    toPath: () => 'foo' 
  }
  return (
    <div>
      <input onChange={e => setName(e.target.value)} type='text' />
      <button onClick={e => stack.push(item)}>Push!</button>
    </div>
  )
}

function Wrapper (props) {
  const stack = useStack()
  let last = stack.length - 1
  let els = stack.renderAll((el, key) => {
    return <div key={key}>{el}</div>
  })
  if (els.length - 4 > 0) els = els.slice(els.length - 4)
  // let els = stack.renderAll(el => el)
  // let lastel = els.pop()
  return (
    <div className='font-sans'>
      <Heading className='p-2'>the stack</Heading>
      <div>{stack.renderBreadcrumb()}</div>
      <div className='flex flex-wrap'>
        {els.map((el, i) => <Panel key={i}>{el}</Panel>)}
      </div>
    </div>
  )

}

export default Root

function ArchiveList (props) {
  const { archives, mode } = props
  const stack = useStack(props)

  if (props.render) return props.render(archives, item => onSelect(item)())

  // useEffect(() => {
    // if (stack.node.next) {
      // let archive = archives.filter(a => a.key === stack.node.next).shift()
      // if (!archive) return
      // onSelect(archive)
    // }
  // }, [])

  const next = item => ({
      Component: Archive,
      name: 'archive',
      props: { item },
      toPath: props => props.item.key
  })

  return (
    <>
      <Heading>Archives</Heading>
      <List items={archives} onClick={onSelect} />
    </>
  )

  function onSelect (e, item) {
    stack.afterMe({
      Component: Archive,
      props: { item },
      toPath: props => props.item.key,
      inParent: e.shiftKey
    })
  }
}

function makeItems (item, cnt) {
  const { name, key } = item
  let items = []
  if (!cnt) cnt = Math.floor(Math.random() * 10)
  for (let i = 0; i <= cnt; i++) {
    items.push({ name: `[${key}] Item ${i}`, key: 'item-' + i })
  }
  return items
}

function Item (props) {
  const { onClick, item } = props
  let clsBoxes ='m-2 p-2 border-2 border-blue text-blue cursor-pointer  inline-block hover:border-blue-dark hover:text-blue-dark hover:bg-blue-light'
  let clsRows ='py-1 px-2 cursor-pointer hover:bg-grey-lightest'
  return (
    <div className={clsRows} onClick={onClick}>
      {item.name}
    </div>
  )
}

function List (props) {
	const { items, onClick } = props
	return (
		<div className=''>
			{items.map((item, i) => <Item key={i} item={item} onClick={e => onClick(e, item)} />)}
		</div>
	)
}

function Heading (props) {
	const { children, className } = props
	let cls = className || ''
	cls += ' text-base font-bold text-blue-dark p-2'
	return <h2 className={cls}>{children}</h2>
}

function Panel (props) {
	const { children } = props
	return (
    <div className='w-1/4'><div className='m-2 border-2 border-grey-light'>{children}</div></div>
	)
}

function Archive (props) {
  const { name, key, mode } = props.item
  const stack = useStack(props)
  const [items, setItems] = useState([])
  const [showBelow, setShowBelow] = useState(false)

  useEffect(() => {
    let items = makeItems(props.item)
    setItems(items)
  }, [key])

  if (props.render) return props.render(items, onSelect)

  return (
    <div>
      <Heading className='p-2'>Archive: {name} {key}</Heading>
      <div>
        { !showBelow && <List items={items} onClick={onSelect} /> }
        { showBelow && <div className='px-2 cursor-pointer' onClick={e => setShowBelow(false)}>go back</div> }
      </div>
      {showBelow && (
        <div className='flex flex-wrap'>
          { stack.renderBelow((el, key) => <div key={key} className='m-2 border-2 border-grey-light bg-grey-lightest'>{el}</div>)}
        </div>
      )}
    </div>
  )

  function onSelect (e, item) {
    if (!showBelow && e.shiftKey) setShowBelow(true)
    stack.afterMe({
      Component: Archive,
      props: { item },
      toPath: props => props.item.key,
      inParent: e.shiftKey,
    })
  }
}

function Foo (props) {
  const { name, key, mode } = props.item
  const stack = useStack(props)
  const [items, setItems] = useState([])
  useEffect(() => {
    let items = []
    let cnt = Math.floor(Math.random() * 10)
    for (let i = 0; i <= cnt; i++) {
      items.push({ name: `[${key}] Foo ${i}`, key: 'item-' + i })
    }
    items.push({ name: 'FILE!!', type: 'file', key: 'foo' })

    setItems(items)

    // if (stack.node.next) {
      // let node = items.filter(a => a.key === stack.node.next).shift()
      // if (!node) return
      // onSelect(node)
    // }
  }, [name])

  if (props.render) return props.render(items, item => onSelect(item)())

  return (
    <div>
      <Heading>Foo : {name} {key}</Heading>
      <List items={items} renderItem={i => i.name} onSelect={onSelect} />
    </div>
  )

  function onSelect (item) {
    return function (e) {
      stack.afterMe({
        Component: item.type === 'file' ? File : Foo,
        props: { item },
        toPath: props => props.item.key,
        inParent: e.shiftKey
      })
    }
  }
}


function File (props) {
  const { name } = props.item
  return (
    <div className='text-3xl text-red'>{name}</div>
  )
}

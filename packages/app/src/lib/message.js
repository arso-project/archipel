import React, { useState } from 'react'

export function useMessage () {
  const [messages, setMessages] = useState([])
  return {
    push,
    Messages: (props) => <Messages single {...props} messages={messages} />
  }

  function push (type, message) {
    if (!message) return push('notice', type)
    message = { type, message }
    setMessages(msgs => [...msgs, message])
  }
}

export function Messages (props) {
  let { messages, single } = props
  messages = messages || []
  if (single) messages = messages.splice(0, 1)

  return (
    <>
      {messages.map((msg, i) => <Message key={i} message={msg.message} type={msg.type} />)}
    </>
  )
}

export function Message (props) {
  let { type, message } = props
  let cls = 'p-2 m-2 rounded'
  let color = 'blue'
  if (type === 'error') color = 'orange'
  if (type === 'success') color = 'green'
  cls += ` text-${color}-darker bg-${color}-lighter border-${color}-light border `
  return (
    <div className={cls}>
      {message}
    </div>
  )
}

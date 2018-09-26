import React from 'react'

const Tag = (props) => {
  const {is, children, ...other} = props
  const El = is || 'div'
  return (
    <El {...other} >
      {children}
    </El>
  )
}

export default Tag

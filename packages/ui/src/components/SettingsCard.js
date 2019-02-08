import React from 'react'
import { MdWarning } from 'react-icons/md'
import { classname } from '../util'
import Heading from './Heading'

const Footer = ({children}) => (
  <div className='-mx-4 -mb-4 mt-4 px-4 py-2 bg-grey-lighter border-t border-black text-xs'>
    {children}
  </div>
)

const SettingsCard = (props) => {
  let textprops = {}
  textprops.className = props.textprops || ''
  let settingsprops = {}
  settingsprops.className = props.settingsprops || ''

  return (
    <div {...classname(props, 'md:w-2/3 sm:full p-4 m-4 border-2 border-black bg-white')}>
      { props.title && <Heading className='mt-0' size='4' >{props.title}</Heading> }
      <div className='p-2 flex flex-row md:flex-nowrap sm:flex-wrap'>
        <div {...classname(textprops, 'm-2')}>
          { props.children }
        </div>
        <div {...classname(settingsprops, 'sm:w-full p-2 m-2 bg-grey-lighter flex flex-col items-baseline justify-end')}>
          { props.explanation && <Explanation> { props.explanation } </Explanation>}
          { props.setting && <Setting> { props.setting } </Setting>}
          { props.warning && <Warning> { props.warning } </Warning> }
        </div>
      </div>
      { props.footer && <Footer>{props.footer}</Footer> }
    </div>
  )
}

const Explanation = (props) => {
  return (
    <div className='m-2'>
      { props.children }
    </div>
  )
}

const Setting = (props) => {
  return (
    <div className='m-2'>
      { props.children }
    </div>
  )
}

const Warning = (props) => {
  return (
    <div className='m-2 flex flex-row justify-start'>
      <MdWarning className='text-red flex-no-shrink mr-1' size='24' />
      <div> { props.children } </div>
    </div>
  )
}

export default SettingsCard

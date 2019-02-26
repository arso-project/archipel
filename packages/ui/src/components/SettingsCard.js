import React from 'react'
import { MdWarning } from 'react-icons/md'
import { classname } from '../util'
// import Heading from './Heading'

function Heading (props) {
  const { children, className } = props
  let cls = className || ''
  cls += ' text-xl mb-4'
  return <h2 className={cls}>{children}</h2>
}

const Footer = ({children}) => (
  <div className='-mx-4 -mb-4 mt-4 px-4 py-2 bg-grey-lighter border-t border-black text-xs'>
    {children}
  </div>
)

function SettingsCard (props) {
  const { explanation, setting, warning, children, title } = props
  let color = 'pink'
  return (
    <div className={`flex sm:flex-wrap md:flex-nowrap m-4 border border-${color} max-w-lg`}>
      <div className='flex-1 p-4'>
        {title && <Heading className={`text-${color}-dark`}>{title}</Heading>}
        {children}
      </div>
      <div className='sm:w-full md:w-1/2 max-w-sm bg-grey-lighter p-4 flex flex-col flex-between'>
        <div className='text-lg italic mb-2'>{explanation}</div>
        <div className=''>{setting}</div>
        {warning && (
          <div className='italic mt-2 flex '>
            <div className='text-orange mr-2'><MdWarning size={36} /></div>
            <div>{warning}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SettingsCard

const SettingsCardOld = (props) => {
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


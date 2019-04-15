import React from 'react'
import { cls } from '../util.js'
import { MdAdd, MdKeyboardReturn } from 'react-icons/md'

let clss = ['inline-flex items-center']

const TightInputForm = (props) => {
  let { type, onChange, value, placeholder, onSubmit, addForm, buttonSize, widthUnits, ...rest } = props
  props = rest
  if (!widthUnits) widthUnits = 7
  if (!value) value = ''
  return (
    <form {...props} className={cls(props, clss)}>
      <input className={'p-1 border border-solid border-grey rounded w-' + (Number(widthUnits) - 1) + '/' + widthUnits}
        type={type}
        onChange={onChange}
        value={value}
        placeholder={placeholder} />
      <div className='flex-1' />
      <button className={'w-1/' + widthUnits} type='submit' onClick={onSubmit}>
        {addForm
          ? <MdAdd className='ml-1' size={buttonSize} />
          : <MdKeyboardReturn className='ml-1' size={buttonSize} />
        }
      </button>
    </form>
  )
}

export default TightInputForm

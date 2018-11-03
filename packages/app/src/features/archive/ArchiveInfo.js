import React from 'react'
import { Consumer, WithCore } from 'ucore/react'
import { Heading, Button } from '@archipel/ui'
import ToggleButton from 'react-toggle-button'
import { MdCheck, MdCancel } from 'react-icons/md'

const Item = ({ label, children }) => (
  <div className='border-grey-light border-b flex'>
    <div className='w-24 px-2 py-4 border-grey-lightest'>
      <strong>{label}: </strong>
    </div>
    <div className='flex-1 px-2 py-4'>
      {children}
    </div>
  </div>
)
const copyToClipboard = str => {
  const el = document.createElement('textarea')
  el.value = str
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
}

const ClickToCopy = ({ children }) => {
  const onClick = (e) => copyToClipboard(children)
  return (
    <span className='bg-grey-lightest rounded-sm p-1 max-w-md truncate cursor-pointer' onClick={onClick}>
      {children}
    </span>
  )
}

const YesNo = ({ children }) => {
  if (!children) return <span className='text-red'><MdCancel />No</span>
  if (children) return <span className='text-green'><MdCheck />Yes</span>
}

class Authorize extends React.Component {
  constructor (props) {
    super(props)
    this.inputRef = React.createRef()
    this.onSubmit = this.onSubmit.bind(this)
    this.state = { res: null }
  }

  async onSubmit (e) {
    let val = this.inputRef.current.value
    if (val) {
      let res = await this.props.onSubmit({ key: this.props.archive, writerKey: val })
      this.setState({ res })
    }
  }

  render () {
    const { res } = this.state
    return (
      <div>
        <div className='flex'>
          <input type='text' ref={this.inputRef} />
          <Button onClick={this.onSubmit}>OK</Button>
        </div>
        { res && <div>{JSON.stringify(res)}</div>}
      </div>
    )
  }
}

const ArchiveInfo = () => {
  return <Consumer store='archive' select={'selectedArchive'}>
    {(archive, { shareArchive, authorizeWriter }) => {
      if (!archive) return null
      let { key, status, info } = archive
      return (
        <div>
          <Item label='Key'><ClickToCopy>{key}</ClickToCopy></Item>
          <Item label='Share'>
            <ToggleButton inactiveLabel='NO' activeLabel='YES'
              value={status.share}
              onToggle={() => shareArchive(key, !status.share)}
            />
          </Item>
          <Item label='Authorized'><YesNo>{status.authorized}</YesNo></Item>
          <Item label='Local key'><ClickToCopy>{status.localWriterKey}</ClickToCopy></Item>
          {status.authorized && (
            <Item label='Authorize'>
              <Authorize archive={key} onSubmit={authorizeWriter} />
            </Item>
          )}
          <Item label='Debug'>
            <WithCore>
              {core => (
                <Button onClick={() => core.rpc.request('debug', { key })}>OK</Button>
              )}
            </WithCore>
          </Item>
        </div>
      )
    }}
  </Consumer>
}

export default ArchiveInfo

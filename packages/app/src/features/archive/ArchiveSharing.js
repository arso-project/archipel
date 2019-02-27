import React, { useState } from 'react'
import { Consumer, WithCore } from 'ucore/react'
import { Button, Checkbox, SettingsCard, StructuresCheckList, ExpandButton } from '@archipel/ui'

import { withApi } from '../../lib/api.js'
import { HttpPublisher } from 'electron-publish';

const TextShare = () => (
  <p>
    If you share your Archive, it will be made available
    in the Dat peer-to-peer network, but <strong>you decide
    to whom.</strong>
  </p>
)

const TextCopyAchiveKey = () => (
  <div>
      <p className='mb-2'>Anbody who has this archive key can read your archive.</p>
      <p>If your want your archive to remain private, only share
        your key with persons you trust, and only share it over trustworthy channels.
      </p>
  </div>
)

// const TextAuthorize = () => (
//   <p>
//     Assuming you have shared your archive and somebody synced it.
//     In this case he/she has a local copy of your archive,
//     but may also add content locally, controled with his/her
//     own local ArchiveKey (LocalKey) (If you create a new archive the ArchiveKey
//     and the LocalKey are the same), without you knowing. If you want
//     to get the changes the other person is doing, you may authorize his/her
//     LocalKey for writing to your archive:
//   </p>
// )

const TextRequestAuthorization = () => (
  <p>
    If you are syncing the archive and/or substructures of somebody else, he or she may also sync
    your local changes. E.g., this would allow you to collaborate on this archive or some work. To do so,
    you have to generate an authorization cypher on the right. Just select all structures you want to request
    authorization for and click generate. Afterwards copy-paste the cipher and send it to the other.
  </p>
)

const copyToClipboard = str => {
  const el = document.createElement('textarea')
  el.value = str
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
}

const ClickToCopy = ({ archiveKey, onClick }) => {
  const displayKey = archiveKey.slice(0, 4) + '...' + archiveKey.slice(-2)
  return (
    <button className='w-32 p-2 cursor-pointer border border-black
      bg-grey-lightest hover:bg-grey
      text-black focus:text-teal-darkest'
      onClick={onClick}>
      {displayKey}
    </button>
  )
}

// class Authorize extends React.Component {
//   constructor (props) {
//     super(props)
//     this.inputRef = React.createRef()
//     this.submit = this.submit.bind(this)
//     this.state = { res: null }
//   }

//   async submit (e) {
//     let val = this.inputRef.current.value
//     if (val) {
//       let res = await this.props.submit({ key: this.props.archive, writerKey: val })
//       this.setState({ res })
//     }
//   }

//   render () {
//     const { res } = this.state
//     return (
//       <div>
//         <div className='flex'>
//           <input type='text' ref={this.inputRef} />
//           <Button onClick={this.submit}>OK</Button>
//         </div>
//         { res && <div>{JSON.stringify(res)}</div>}
//       </div>
//     )
//   }
// }

// const StructuresCheckList = function ({ structures, onSelect, selected }) {
//   if (!structures) return ''
//   let listItems = structures.map(i => <li key={'reqAuthItem' + i.key}>
//     <Checkbox id={'reqAuthItemCheck' + i.key} label={i.type}
//       checked={selected[i.key] || false}
//       onChange={(e) => onSelect(e.target.checked, i.key)} />
//   </li>)

//   return (
//     <ul className='list-reset'>
//       {listItems}
//     </ul>
//   )
// }

class ReqAuthorizationInner extends React.Component {
  constructor (props) {
    super(props)
    this.submit = this.submit.bind(this)
    this.StructuresCheckList = StructuresCheckList.bind(this)
    this.promptMsg = 'please select structures!'
    this.state = {
      selected: {},
      expanded: false,
      userMsg: null,
      res: null
    }
    // this.onExpand = this.onExpand.bind(this)
  }

  async componentDidMount () {
    await this.switchAll()
    this.submit()
  }

  async submit () {
    const { archive } = this.props
    let { selected, userMsg, expanded } = this.state
    const { requestAuthorizationMsg } = this.props.api.hyperlib

    let requestItems = []
    for (let i of Object.keys(selected)) {
      if (selected[i]) requestItems.push(i)
    }

    if (requestItems.length > 0) {
      // let res = await this.props.submit(selected)
      const res = await requestAuthorizationMsg(archive.key, requestItems, userMsg)
      if (expanded) selected = {}
      this.setState({ res, selected })
    } else {
      this.setState({ res: this.promptMsg })
    }
  }

  async onSelect (bool, key) {
    let { selected, expanded } = this.state
    if (!expanded) return this.switchAll()
    selected[key] = bool
    this.setState({ selected })
  }

  async switchAll (toBeState) {
    let { selected } = this.state
    let { archive } = this.props

    if (toBeState === undefined || toBeState === null) {
      toBeState = !selected[archive.key]
    }

    selected[archive.key] = toBeState
    for (let i of archive.structures) {
      selected[i.key] = toBeState
    }
    await this.setState({ selected })
  }

  onExpand () {
    let { expanded, selected } = this.state
    let { archive } = this.props
    this.setState({ expanded: !expanded })
    this.switchAll(selected[archive.key])
  }

  render () {
    const { selected, res, expanded } = this.state
    console.log(expanded, res)
    const { archive } = this.props
    return (
      <div className='flex flex-col'>
        <div className='flex flex-col '>
          <div className='flex'>
            <Checkbox className='flex-1 text-lg'
              id='authPrimCheck' label={archive.info.title + (expanded ? '/' + archive.type : '')}
              checked={selected[archive.key] || false}
              onChange={(e) => this.onSelect(e.target.checked, archive.key)} />
            <ExpandButton expanded={expanded} size={24} onClick={() => this.onExpand()} />
          </div>
          <StructuresCheckList
            indent='4'
            expanded={expanded}
            structures={archive.structures}
            idSub='authReqItems'
            onSelect={this.onSelect.bind(this)}
            selected={selected} />
        </div>
        <textarea className='w-auto m-2' placeholder='Add a custom message to the request'
          rows='1'
          onChange={(e) => this.setState({ userMsg: e.target.value })} />
        {/* <textarea className='bg-transparent resize-none m-2' readOnly placeholder='Authentification Message'
          value={res} rows='3' /> */}
        <Button className='flex-1 w-auto h-auto m-2 ml-2 p-1' onClick={this.submit}>
          Regenerate Token</Button>
        <Button className='flex-1 w-auto h-auto m-2 mr-2 p-1' onClick={e => copyToClipboard(res)}>
          Copy to Clipboard </Button>
      </div>
    )
  }
}


const ReqAuthorization = withApi(ReqAuthorizationInner)

const Sharing = ({ archive, onShare /*, authorizeWriter*/}) => {
  const [copied, setCopied] = useState(false)
  let { key, state } = archive
  return (
    <div className='flex flex-col justify-between'>

      <SettingsCard
        title='Share this archive'
        explanation={state.share
          ? 'click to unshare'
          : 'click to share'
        }
        setting={state.share
          ? <Button className='w-32 h-24 bg-green text-lg'
            onClick={() => onShare(key, !state.share)}>
            shared
          </Button>
          : <Button className='w-32 h-24 bg-grey-darkest text-lg'
            onClick={() => onShare(key, !state.share)}>
            not shared
          </Button>
        }>
        <TextShare />
      </SettingsCard>

      {state.share
        ? <SettingsCard
          title='Send the archive key to others'
          settingsprops='w-40 md:w-40'
          explanation={copied ? 'copied to clipboard!' : 'click to copy:'}
          setting={
            <ClickToCopy archiveKey={key} onClick={e => onCopyClick()} />
          }
          warning='Only send to trusted people and over trustworthy encrypted channels!'>
          <TextCopyAchiveKey />
        </SettingsCard>
        : '' }

      {/* {state.share
        ? <SettingsCard title='3. Authorize others back and sync their changes.'
          setting={<Authorize submit={authorizeWriter} archive={key} />}
          explanation='Enter ArchiveKey to authorize:'>
          <TextAuthorize />
        </SettingsCard>
        : '' } */}

      {state.share
        ? <SettingsCard title='Request write access'
          setting={<ReqAuthorization archive={archive} />}
          explanation='Authorization Message for'
          warning='Only the original archive creator can decrypt the cypher.'>
          <TextRequestAuthorization />
        </SettingsCard>
        : '' }

    </div>
  )

  // todo: setCopied may be invoked on unounted component. Fix with useTimeout hook.
  function onCopyClick () {
    copyToClipboard(key)
    setCopied(true)
    setTimeout(() => setCopied(false), 1000)
  }
}

const ArchiveSharing = () => {
  return <Consumer store='archive' select={'selectedArchive'}>
    {(archive, { shareArchive, authorizeWriter }) => {
      if (!archive) return null
      let { key, state } = archive
      return (<Sharing archive={archive} onShare={shareArchive} authorizeWriter={authorizeWriter} />)
    }}
  </Consumer>
}

export default ArchiveSharing

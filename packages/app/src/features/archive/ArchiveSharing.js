import React from 'react'
import { Consumer, WithCore } from 'ucore/react'
import { Button, Checkbox, SettingsCard, StructuresCheckList } from '@archipel/ui'

import { withApi } from '../../lib/api.js'
import { HttpPublisher } from 'electron-publish';

const TextShare = () => (
  <p>
    If you share your Archive, it will be made available
    in the Dat peer-to-peer network, but <strong>you decide
    to whom.</strong> If you decide to share your archive,
    we will guide you through the access control mechanism
    in the following.
  </p>
)

const TextCopyAchiveKey = () => (
  <div>
    <strong>
      Only send the following key on secure and encrypted
      ways and only to trusted people!
    </strong>
    <p>
      You may copy your ArchiveKey to your clipboard, buy clicking
      the above shorthand of it.
      This ArchiveKey has two important features. Firstly, in the
      Dat peer-to-peer network it is the ID of your archive. Hence,
      who does not know this ArchiveKey, can't find your archive
      anywhere, even now, while it is shared and available in the
      Dat peer-to-peer network.

      Secondly, the ArchiveKey is used to encrypt your archive. Therefore,
      nobody without the ArchiveKey can read your archive. This also means,
      nobody without it can read the data-stream transfered between you and
      any person you shared your ArchiveKey with.

      This has important consequences:
    </p>
    <ul>
      <li>Anbody having your ArchiveKey can read your archive.</li>
      <li>Your archive is only as secret as the people you are
        sharing it with are trustworthy.</li>
      <li>If your want your archive to remain save, only share
        your key with persons you trust, and only share it over trustworthy channels.
        I.e. do not send it over unecrypted e-mail or messaging.</li>
    </ul>
  </div>
)

const TextAuthorize = () => (
  <p>
    Assuming you have shared your archive and somebody synced it.
    In this case he/she has a local copy of your archive,
    but may also add content locally, controled with his/her
    own local ArchiveKey (LocalKey) (If you create a new archive the ArchiveKey
    and the LocalKey are the same), without you knowing. If you want
    to get the changes the other person is doing, you may authorize his/her
    LocalKey for writing to your archive:
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

const ClickToCopy = ({ archiveKey }) => {
  const displayKey = archiveKey.slice(0, 4) + '...' + archiveKey.slice(-2)
  return (
    <button className='w-32 p-2 cursor-pointer border border-black
      bg-grey-lightest hover:bg-grey
      text-black focus:text-teal-darkest'
      onClick={() => copyToClipboard(archiveKey)}>
      {displayKey}
    </button>
  )
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
    this.onSubmit = this.onSubmit.bind(this)
    this.StructuresCheckList = StructuresCheckList.bind(this)
    this.promptMsg = 'please select structures!'
    this.state = {
      selected: {},
      userMsg: null,
      res: this.promptMsg
    }
  }

  async onSubmit (e) {
    const { archive } = this.props
    const { selected, userMsg } = this.state
    const { requestAuthorizationMsg } = this.props.api.hyperlib

    let requestItems = []
    for (let i of Object.keys(selected)) {
      if (selected[i]) requestItems.push(i)
    }

    if (requestItems.length > 0) {
      // let res = await this.props.onSubmit(selected)
      const res = await requestAuthorizationMsg(archive.key, requestItems, userMsg)
      this.setState({ res, selected: {} })
    } else {
      this.setState({ res: this.promptMsg })
    }
  }

  async onSelect (bool, key) {
    let { selected } = this.state
    selected[key] = bool
    this.setState({ selected })
  }

  render () {
    const { selected, res } = this.state
    const { archive } = this.props
    return (
      <div className='flex flex-col'>
        <Checkbox id='authPrimCheck' label={archive.info.title + '/' + archive.type}
          checked={selected[archive.key] || false}
          onChange={(e) => this.onSelect(e.target.checked, archive.key)} />
        <div className='pl-4'>
          <StructuresCheckList structures={archive.structures}
            idSub='authReqItems'
            onSelect={this.onSelect.bind(this)}
            selected={selected} />
        </div>
        <textarea placeholder='Add a custom message to the request'
          onChange={(e) => this.setState({ userMsg: e.target.value })} />
        <Button onClick={() => this.onSubmit()}>Generate Authentification Request</Button>
        <textarea readOnly placeholder='Authentification Message'
          value={res} cols='20' rows='8' />
      </div>
    )
  }
}

const ReqAuthorization = withApi(ReqAuthorizationInner)

const Sharing = ({ archive, onShare, authorizeWriter }) => {
  let { key, state } = archive
  return (
    <div className='flex flex-col justify-between'>

      <SettingsCard
        title='1. Make your archive available to others'
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
          title='2. Send your ArchiveKey to trustwothy others'
          settingsprops='w-40 md:w-40'
          explanation='click to copy:'
          setting={
            <ClickToCopy archiveKey={key} />
          }
          warning='Only send to trusted people and over trustworthy encrypted channels!'>
          <TextCopyAchiveKey />
        </SettingsCard>
        : '' }

      {state.share
        ? <SettingsCard title='3. Authorize others back and sync their changes.'
          setting={<Authorize onSubmit={authorizeWriter} archive={key} />}
          explanation='Enter ArchiveKey to authorize:'>
          <TextAuthorize />
        </SettingsCard>
        : '' }

      {state.share
        ? <SettingsCard title='3. Authorize others back and sync their changes.'
          setting={<ReqAuthorization archive={archive} />}
          explanation='Select Structures:'>
          <TextAuthorize />
        </SettingsCard>
        : '' }

    </div>
  )
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

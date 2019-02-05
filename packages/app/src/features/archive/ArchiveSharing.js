import React from 'react'
import { Consumer, WithCore } from 'ucore/react'
import { Button, Foldable, Card } from '@archipel/ui'
import ToggleButton from 'react-toggle-button'
import { MdCheck, MdCancel, MdWarning } from 'react-icons/md'
import NetStats from './NetStats'

const Item = ({ label, children }) => (
  <div className='border-grey-light border-b flex'>
    <div className='w-24 px-2 py-4 border-grey-lightest'>
      <strong>{label}</strong>
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

const ClickToCopy = ({ archiveKey }) => {
  const displayKey = archiveKey.slice(0, 4) + '...' + archiveKey.slice(-2)
  return (
    <div className='flex flex-col'>
      <span className='rounded-sm p-1 m-1 text-base'>
        <MdWarning className='text-red' size='24' /> Only send to trusted people and over trustworthy encrypted channels
      </span>
      <span className='bg-white rounded-sm p-1 m-1 max-w-md
      truncate cursor-pointer hover:text-red-darkest
      active:bg-grey-light' onClick={
        () => copyToClipboard(archiveKey)}
      >
        <strong className='pr-2'>
          {displayKey}
        </strong>
        (click to copy)
      </span>
    </div>
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

const Sharing = ({ archive, onShare, authorizeWriter }) => {
  let { key, status } = archive
  return (
    <div className='flex flex-col justify-between w-1/2'>
      <Card
        title='1. Make your archive available to others'
        footer={
          <Button onClick={() => onShare(key, !status.share)}>
            {status.share ? 'Unshare' : 'Share'}
          </Button>
        }
      >
        <Foldable heading='If your share your Archive, ...'>
          it will be made available in the Dat peer-to-peer network,
          but <strong>you decide to whom.</strong>
          If you decide to share your archive, we will guide
          you through the access control mechanism in the following.
        </Foldable>
      </Card>
      {status.share
        ? <Card
          title='2. Send your ArchiveKey to trustwothy others'
          footer={
            <ClickToCopy archiveKey={key} />
          }
        >
          <Foldable
            heading='Only send the following key on secure and encrypted
            ways and only to trusted people! ...'
          >
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
          </Foldable>
        </Card>
        : ''
      }
      {status.share
        ? <Card title='3. Authorize others back.' footer={<Authorize />}>
          <Foldable
            heading='Sync back changes of others...' >
              Assuming you have shared your archive and somebody synced it.
              In this case he/she has a local copy of your archive,
              but may also add content locally, controled with his/her
              own local ArchiveKey (LocalKey) (If you create a new archive the ArchiveKey
              and the LocalKey are the same), without you knowing. If you want
              to get the changes the other person is doing, you may authorize his/her
              LocalKey for writing to your archive:
          </Foldable>
        </Card>
        : ''
      }
    </div>
  )
}

const ArchiveSharing = () => {
  return <Consumer store='archive' select={'selectedArchive'}>
    {(archive, { shareArchive, authorizeWriter }) => {
      if (!archive) return null
      let { key, status } = archive
      console.log('Consumer:', key, shareArchive)
      return (<Sharing archive={archive} onShare={shareArchive} authorizeWriter={authorizeWriter} />)
    }}
  </Consumer>
}

export default ArchiveSharing

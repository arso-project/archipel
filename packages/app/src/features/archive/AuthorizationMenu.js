import React from 'react'
import { Foldable, Button, InfoPopup } from '@archipel/ui'

import { withApi } from '../../lib/api.js'
import { Checkbox, StructuresCheckList } from '../../../../ui/src/index.js';

class AuthorizationMenuInner extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      authCipher: null,
      authObj: null,
      archive: null,
      selected: {},
      notRequested: {}
    }
    this.api = this.props.api.hyperlib
    // this.onSelect = this.onSelect.bind(this)
  }

  async submitCipher () {
    let { authCipher } = this.state
    if (authCipher) {
      let authObj = await this.api.decipherAuthorizationMsg(authCipher)
      if (!authObj) {
        authObj = 'Sorry, unknown error.'
        this.setState({ authObj })
        return
      }
      let archive = await this.api.openArchive({ key: authObj.primaryKey }) || null
      this.setState({ authObj, archive, authCipher: null, selected: {} })
      this.checklistElements(archive, authObj)
    }
  }

  async submitAuthorization () {
    let { archive, selected, authObj, authCipher } = this.state
    let toBeAuthorized = []
    for (let i of Object.keys(selected)) {
      if (selected[i]) toBeAuthorized.push(i)
    }
    let results = await this.api.authorizeWriter(archive.key, authObj.writerKey, toBeAuthorized)
    if (results.length && results.length === toBeAuthorized.length) {
      authCipher = 'Authorization successful'
    } else {
      authCipher = 'Auhtorization failed for unknown reasons. The cipher could be corrupted or you are not the original owner of the archive.'
    }
    this.setState({ authCipher, authObj: null, archive: null, selected: {}, notRequested: {} })
  }

  async checklistElements (archive, authObj) {
    let notRequested = {}
    let selected = {}
    notRequested[archive.key] = !authObj.structures.find((s) => (s === archive.key))
    for (let i of archive.structures) {
      notRequested[i.key] = !authObj.structures.find((s) => (s === i.key))
      selected[i.key] = false
    }
    this.setState({ notRequested, selected })
  }

  async onSelect (bool, key) {
    let { selected } = this.state
    selected[key] = bool
    this.setState({ selected })
  }

  render () {
    let { authCipher, authObj, archive, notRequested, selected } = this.state
    let heading = 'Authorize write access'
    let content
    if (!authObj) {
      // Enter Authorization Cypher
      content = (
        <div>
          <div className='flex flex-col w-40'>
            <strong htmlFor='inputAuthorizationCipher'
              className='m-1 mb-2'>
              Enter cipher:
              <InfoPopup wInfo='w-48' info='To authorize others to write to your archives, they need to generate a request cipher. If you received one, you may enter it below.' />
            </strong>
            <textarea id='inputAuthorizationCipher' name='inputAuthorizationCipher'
              placeholder='Authorization Cipher'
              value={authCipher || ''} cols='10' rows='8'
              onChange={(e) => this.setState({ authCipher: e.target.value })}
            />
            <Button className='p-1 m-1' onClick={() => this.submitCipher()}>
              Submit
            </Button>
          </div>
        </div>
      )
    } else if (!notRequested) {
      content = (
        <span>loading...</span>
      )
    } else if (!archive) {
      // something went wrong
      content = (
        <div className='w-full flex flex-col'>
          <strong className='w-32 break-normal'>{authObj}</strong>
          <Button className='p-1 m-1' onClick={() => this.setState({ authObj: null })}>
            Back
          </Button>
        </div>
      )
    } else {
      // choose structures for authorization
      content = (
        <>
          <div className='flex flex-col'>
            { authObj.userMessage
              ? <div className='flex flex-col'>
                <strong className='pl-1 pt-1 pb-1'>User Message:</strong>
                <textarea readOnly className='w-40' value={authObj.userMessage} />
              </div>
              : <span>no user message</span>}
            <strong className='pl-1 pt-1 pb-1'>
            Please select:
              <InfoPopup wInfo='w-48' info='Select those structures you would like to give authorization for and klick "Authorize". If some are greyed out, they were not requested.' />
            </strong>
            <div className='flex flex-col p-1 m-1 bg-white border-none rounded'>
              <Checkbox id='authMenuPrimCheck' label={archive.info.title + '/' + archive.type}
                checked={selected[archive.key] || false}
                onChange={(e) => this.onSelect(e.target.checked, archive.key)} disabled={notRequested[archive.key]} />
              <div className='pl-4'>
                <StructuresCheckList structures={archive.structures}
                  idSub='authMenuItems'
                  onSelect={this.onSelect.bind(this)}
                  disabled={notRequested} selected={selected} />
              </div>
            </div>
          </div>
          <div className='flex'>
            <Button className='m-1 p-1'
              onClick={() => this.setState({ authObj: null })} >
              Back
            </Button>
            <Button className='m-1 p-1'
              onClick={() => this.submitAuthorization()} >
              Authorize
            </Button>
          </div>
        </>
      )
    }
    return (
      <div>
        <h2 className='text-xl mb-2'>{heading}</h2>
        {content}
      </div>
    )
  }
}

const AuthorizationMenu = withApi(AuthorizationMenuInner)
export default AuthorizationMenu

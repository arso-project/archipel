import React from 'react'
import { Foldable, Button, InfoPopup } from '@archipel/ui'

import { withApi } from '../../lib/api.js'
import { Checkbox, StructuresCheckList } from '../../../../ui/src/index.js';

class AuthorizationMenuInner extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      selected: {},
      notRequested: {},
      authCipher: null,
      authObj: null
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

  async submitAuthorization () {
    let { archive, selected, authObj } = this.state
    let toBeAuthorized = []
    for (let i of Object.keys(selected)) {
      if (selected[i]) toBeAuthorized.push(i)
    }
    let results = await this.api.authorizeWriter(archive.key, authObj.writerKey, toBeAuthorized)
  }

  render () {
    let { authCipher, authObj, archive, notRequested, selected } = this.state
    let foldHeading = 'Authentify Writer'
    if (!authObj) {
      return (
        <Foldable heading={foldHeading}>
          <div className='flex flex-col w-40'>
            <strong htmlFor='inputAuthorizationCipher'
              className='m-1 mb-2'>
              Enter cipher:
              <InfoPopup info='To authorize others to write to your archives, they need to generate a request cipher. If you received one, you may enter it below.' />
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
        </Foldable>
      )
    } else if (!notRequested) {
      return (
        <Foldable heading={foldHeading} open>
          <span>loading...</span>
        </Foldable>
      )
    } else if (!archive) {
      return (
        <Foldable heading={foldHeading} open>
          <div className='w-full flex flex-col'>
            <strong className='w-32 break-normal'>{authObj}</strong>
            <Button className='p-1 m-1' onClick={() => this.setState({ authObj: null })}>
              Back
            </Button>
          </div>
        </Foldable>
      )
    } else {
      return (
        <Foldable heading={foldHeading} open>
          <div className='flex flex-col'>
            { authObj.userMessage
              ? <div className='flex flex-col'>
                <strong className='pl-1 pt-1 pb-1'>User Message:</strong>
                <textarea readOnly className='w-40'>{authObj.userMessage}</textarea>
              </div>
              : <span>no user message</span>}
            <strong className='pl-1 pt-1 pb-1'>
            Please select:
              <InfoPopup info='Select those structures you would like to give authorization for and klick "Authorize". If some are greyed out, they were not requested.' />
            </strong>
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
          {/* <p className='w-32 break-word'>
            {JSON.stringify(authObj)}
          </p> */}
        </Foldable>
      )
    }
  }
}

const AuthorizationMenu = withApi(AuthorizationMenuInner)
export default AuthorizationMenu

import React from 'react'
import { Foldable, Button, Heading } from '@archipel/ui'

import { withApi } from '../../lib/api.js'
import { Checkbox, StructuresCheckList } from '../../../../ui/src/index.js';

class AuthorizationMenuInner extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      authMsg: null,
      authObj: null
    }
  }

  async submitMsg () {
    let { authMsg } = this.state
    if (authMsg) {
      this.setState({
        authObj: await this.props.api.hyperlib.decipherAuthorizationMsg(authMsg),
        authMsg: null,
        selected: {}
      })
    }
  }

  render () {
    let { authMsg, authObj } = this.state
    if (!authObj) {
      return (
        <Foldable heading='Authentify Writer'>
          <div className='flex flex-col'>
            <label htmlFor='inputAuthentificationMsg'
              className='break-word w-32'>
              { 'If you receifed an authentification request, please enter the message below:' }
            </label>
            <textarea id='inputAuthentificationMsg' name='inputAuthentificationMsg'
              placeholder='Authentification Message'
              value={authMsg || ''} cols='10' rows='8'
              onChange={(e) => this.setState({ authMsg: e.target.value })}
            />
            <Button onClick={() => this.submitMsg()}>
              Submit
            </Button>
          </div>
        </Foldable>
      )
    } else {
      return (
        <Foldable heading='AuthentifyWriter' open={true}>
          {/* <div className='flex flex-col'>
            <StructuresCheckList structures={auth.structures}
              onSelect={this.onSelect.bind(this)}
              selected={selected} />
          </div> */}
          <p className='w-32 break-word'>
            {JSON.stringify(authObj)}
          </p>
        </Foldable>
      )
    }
  }
}

const AuthorizationMenu = withApi(AuthorizationMenuInner)
export default AuthorizationMenu

import { WithStore, WithArchive } from '../../api/store.js'
import React from 'react'
import pify from 'pify'

class ViewArchive extends React.Component {
  constructor () {
    super()
    this.state = {}
    console.log('constr')
  }

  componentDidUpdate (prevProps, prevState, snapshot) {
    console.log('didupdate', this.props.archive, prevProps.archive)
    if (this.props.archive !== prevProps.archive) {
      this.refetch()
    }
  }

  componentDidMount () {
    this.refetch()
  }

  refetch () {
    const archive = this.props.getArchive()
    const fs = this.props.getFs()
    const self = this
    getJson()
    getInfo()
    async function getJson () {
      try {
        let datjson = await pify(fs.readFile)('dat.json')
        datjson = datjson.toString()
        console.log('datjson', datjson)
        self.setState({...self.state, datjson})
      } catch (e) {
        self.setState({...self.state, error: e.message})
      }
    }
    async function getInfo () {
      try {
        const info = await archive.info()
        self.setState({ ...self.state, info })
      } catch (e) {
        self.setState({ ...self.state, error: e.message })
      }
    }
  }

  render () {
    console.log('VIEW!', this.props, this.state)
    return (
      <div>
        { this.state.info && <em>VIEW: {this.state.info.key}</em> }
        { this.state.error && <strong>{this.state.error}</strong>}
        { this.state.datjson && <pre>{this.state.datjson}</pre>}
      </div>
    )
  }
}

class ListArchives extends React.Component {
  constructor (props) {
    super()
    this.state = {}
    // this.store = props.store
    this.selectArchive = this.selectArchive.bind(this)
  }

  componentDidMount () {
    console.log(this.props)
    // const { api, getState, setState } = this.store
    const st = this.props.getStore().getState()
    const self = this
    getArchives().then((archives) => self.setState({archives}))

    async function getArchives () {
      console.log('ST', st)
      if (!st.workspace) st.workspace = await st.rootspace.getDefaultWorkspace()
      const archives = await st.workspace.getArchives()
      console.log('got archives', archives)
      return archives
    }
  }

  selectArchive (key) {
    const self = this
    return function () {
      self.setState({...self.state, archive: key})
    }
  }

  render () {
    return (
      <div>
        { this.state.archives &&
          <ul>
            { this.state.archives.map((a, i) => <li key={i} onClick={this.selectArchive(a.key)}>{a.title} {a.key}</li>) }
          </ul>
        }
        {this.state.archive &&
          <WithArchive archive={this.state.archive}
            error={({error}) => <strong>ERROR: {error}</strong>}
            loading={() => <strong>Loading...</strong>}
            complete={(props) => <ViewArchive {...props} />}
          />}
      </div>
    )
  }
}

export default (props) => (
  <WithStore>
    {ctx => <ListArchives {...ctx} {...props} />}
  </WithStore>
)
// export default connect(ListArchives)

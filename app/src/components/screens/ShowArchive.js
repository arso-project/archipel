import React from 'react'
import { connect } from 'react-redux'
import { openWorkspace } from './../../api/workspace'

function dirlist (drive, cb) {
  var missing = 1
  var list = []
  rec('', list)

  function rec (dir, list) {
    drive.readdir(dir, (err, names) => {
      names = names.filter((n) => n)
      missing = missing + names.length - 1
      if (!names.length) maybeDone()
      if (err) return
      names.forEach((name) => {
        var path = dir + '/' + name
        drive.stat(path, (err, stat) => {
          var shared = {name, stat, path}
          if (err) return
          if (stat.isDirectory()) {
            var pos = list.push({...shared, dir: true, children: []})
            rec(path, list[pos - 1].children)
          } else {
            list.push({...shared, dir: false})
            missing--
            maybeDone()
          }
        })
      })
    })
  }

  function maybeDone () {
    if (!missing) cb(null, list)
  }
}

const Dirlist = ({dirlist, setPath}) => (
  <ul className='pl-2'>
    {dirlist.map((dir, i) => <li key={i} className={dir.dir ? 'text-blue' : 'text-red'}>
      <span className='cursor-pointer' onClick={(e) => setPath(dir.path)}>{dir.name}</span>
      {dir.children && <Dirlist dirlist={dir.children} setPath={setPath} />}
    </li>)}
  </ul>
)

class FileView extends React.Component {
  constructor () {
    super()
    this.state = {
      content: ''
    }
  }
  componentDidUpdate (prevProps, prevState, snapshot) {
    if (this.props.path !== prevProps.path) {
      const archive = this.props.archive
      const Workspace = openWorkspace(this.props.workspace)
      Workspace.getDrive(archive.drive.key, (err, drive) => {
        if (err) return console.log(err)
        drive.readFile(this.props.path, (err, data) => {
          if (err) return console.log(err)
          this.setState({ content: data.toString('utf-8') })
        })
      })
    }
  }

  render () {
    if (this.props.path) return <div><em>{this.props.path}</em><hr/><code>{this.state.content}</code></div>
    else return <div><em>Select file</em></div>
  }
}

class ShowArchive extends React.Component {
  constructor () {
    super()
    this.state = {
      archive: null,
      datjson: null,
      dirPath: '/',
      dirlist: [],
      path: null
    }
  }

  componentDidMount () {
    const archive = this.props.archives[this.props.archive]
    this.setState({archive})

    const Workspace = openWorkspace(this.props.workspace)
    Workspace.getDrive(archive.drive.key, (err, drive) => {
      if (err) return console.log(err)
      drive.readFile('/dat.json', (err, data) => {
        if (err) return console.log(err)
        this.setState({ datjson: data.toString('utf-8') })
      })

      dirlist(drive, (err, data) => {
        if (err) return
        if (data) this.setState({dirlist: data})
      })
    })
  }

  render () {
    console.log('render', this.state)
    const { archive, datjson, dirlist, path } = this.state
    if (!archive) return <span>No archive</span>

    return (
      <div className='p-4'>
        <em>Show archive</em>
        <h2>{archive.title}</h2>
        <div className='flex'>
          <div className='p-2 border-2 w-64'>
            { dirlist && <Dirlist dirlist={dirlist} setPath={(path) => this.setState({path})} /> }
          </div>
          <div className='p-2 border-2'>
            <FileView archive={archive} path={path} workspace={this.props.workspace} />
          </div>
        </div>

        <h5>Helpers (in DevConsole)</h5>
        <blockquote>
          <strong>readFile:</strong>
          <pre>
          rpc((api) => api.workspace.drive.readFile('{this.props.workspace}', '{this.props.archive}', 'directory1/textfile.txt', (err, data) => console.log('readFile', err, data) ) )
          </pre>
          <strong>writeFile:</strong>
          <pre>
          rpc((api) => api.workspace.drive.writeFile('{this.props.workspace}', '{this.props.archive}', 'directory1/textfile.txt', 'Hello world!', {'{}'}, (err, data) => console.log('writeFile', err, data) ) )
          </pre>
          <strong>mkdir</strong>
          <pre>
          rpc((api) => api.workspace.drive.mkdir('{this.props.workspace}', '{this.props.archive}', 'directory1', {'{}'}, (err, data) => console.log('mkdir', err, data)))
          </pre>
        </blockquote>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => ({
})

const mapStateToProps = (state, props) => ({
  archives: state.archives,
  archive: state.ui.archive,
  workspace: state.workspace
})

export default connect(mapStateToProps, mapDispatchToProps)(ShowArchive)

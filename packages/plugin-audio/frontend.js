'use strict'
import React from 'react'
// import { AudioControls } from '@archipel/ui'
import { Button, List } from '@archipel/ui'
import './AudioControls.css'
import { MdPause, MdPlayArrow, MdStop, MdVolumeUp, MdVolumeMute } from 'react-icons/md'
import { metadataExtractor } from './metadataExtractor'
import registry from '@archipel/app/src/lib/component-registry'

export default function start () {
  registry.add('fileViewer', AudioPlayer, {
    stream: false,
    match: (file) => {
      return file.mimetype && file.mimetype.match(/audio\/.*/)
    }
  })
}

export class AudioPlayer extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      // content: this.props.content,
      // stat: this.props.stat,
      loaded: false,
      duration: 0,
      position: 0,
      gainPPH: 100,
      playing: false,
      paused: true
    }
    this.playerRef = React.createRef()
    this.playbackTimer = null
    this.positionControl = this.positionControl.bind(this)
    // this.onPlay = this.onPlay.bind(this)
  }

  componentDidMount () {
    let metadata = metadataExtractor(this.props.content)
    this.setState({ metadata })
    if (!this.audioContext) this.createAudioContext()
  }

  createAudioContext () {
    if (this.audioContext) return
    const audioCtx = new AudioContext() || new webkitAudioContext()
    audioCtx.suspend()
    audioCtx.createMediaElementSource(this.playerRef.current)
    let gainNode = audioCtx.createGain()
    // let source = audioCtx.createBufferSource()
    audioCtx.decodeAudioData(this.props.content.buffer, (buffer) => {
      if (this._willUnmount) return
      this.setState({ audioCtx, gainNode, buffer, duration: buffer.duration, loaded: true })
      this.positionControl(0)
      audioCtx.suspend()
    }, (err) => { console.log('Error decoding audio data:', err) })
    this.audioContext = audioCtx
  }

  componentDidUpdate (prevProps) {
    if (prevProps.content !== this.props.content) {
      // console.log(prevProps)
      // console.log(this.props)
      this.setState({ loaded: false })
      this.onStop()
      let metadata = metadataExtractor(this.props.content)
      this.setState({ metadata })
      if (!this.audioContext) this.createAudioContext()
    }
  }

  componentWillUnmount () {
    this._willUnmount = true
    if (this.playbackTimer) clearInterval(this.playbackTimer)
    let { source } = this.state
    if (source) source.stop()
  }

  playSource (position) {
    let { audioCtx, gainNode, source, buffer, playing } = this.state

    console.log(this.props.content)

    if (playing) source.stop()

    source = audioCtx.createBufferSource()
    source.buffer = buffer
    source.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    source.start(audioCtx.currentTime, position)
    this.positionControl(position)

    this.setState({ source, playing: true, paused: false })
  }

  positionControl (pos) {
    let { audioCtx } = this.state
    pos = Number(pos)
    if (this.playbackTimer) clearInterval(this.playbackTimer)

    let lastCalled = audioCtx.currentTime
    let position = 0

    this.playbackTimer = setInterval(() => {
      // console.log('lastCalled', lastCalled, 'currentTime', audioCtx.currentTime, 'pos', pos)
      position = audioCtx.currentTime - lastCalled + pos
      // console.log('position', position)
      this.setState({ position })
    }, 2000)
  }

  onPlay () {
    let { audioCtx, playing, paused } = this.state

    if (!playing) this.playSource(0)

    if (paused) {
      audioCtx.resume()
      this.setState({ paused: false })
    } else {
      audioCtx.suspend()
      this.setState({ paused: true })
    }
  }

  onStop () {
    let { audioCtx, source, playing } = this.state

    if (playing) {
      audioCtx.suspend()
      source.stop()
      this.setState({ position: 0 })
    }

    if (this.playbackTimer) clearInterval(this.playbackTimer)
    this.setState({ playing: false, paused: true })
  }

  onPositionChange (e) {
    this.playSource(e.target.value)
    this.setState({ position: e.target.value })
  }

  onMute () {
    this.state.gainNode.gain.value = 0
    this.setState({ gainPPH: 0 })
  }

  onFullVol () {
    this.state.gainNode.gain.value = 1
    this.setState({ gainPPH: 100 })
  }

  onVolumeChange (e) {
    let fraction = e.target.value / 100
    this.state.gainNode.gain.value = fraction * fraction
    this.setState({ gainPPH: e.target.value })
  }

  render () {
    let { loaded, duration, position, gainPPH, paused, fileText, metadata } = this.state
    let symSize = 24
    return (
      <div className='flex flex-col'>
        <audio ref={this.playerRef} />
        { loaded
          ? <div className='ctrl'>
            <Button className='ctrlBttn' onClick={() => this.onPlay()}> {paused ? <MdPlayArrow size={symSize} /> : <MdPause size={symSize} />} </Button>
            <div className='sliderWrapper'>
              <input type='range' list='posTickMarks'
                min='0' max={duration} value={position} // step='0.05'
                onChange={(e) => this.onPositionChange(e)}
              />
              <datalist id='posTickMarks'>
                <option value={0} label='0:00' />
                <option value={duration} label={duration} />
              </datalist>
            </div>
            <Button className='ctrlBttn' onClick={() => this.onStop()}> <MdStop size={symSize} /> </Button>
            <div className='verticalLine' />
            <Button className='ctrlBttn' onClick={() => this.onMute()}> <MdVolumeMute size={symSize} /> </Button>
            <div className='sliderWrapper'>
              <input type='range' list='volTickMarks'
                min='0' max='100' value={gainPPH}
                default='100'
                onChange={(e) => this.onVolumeChange(e)}
              />
              <datalist id='volTickMarks'>
                <option value='0' label='0%'>0</option>
                <option value='25'>25</option>
                <option value='50'>50</option>
                <option value='75'>75</option>
                <option value='100' label='100%'>100</option>
              </datalist>
            </div>
            <Button className='ctrlBttn' onClick={() => this.onFullVol()}> <MdVolumeUp size={symSize} /> </Button>
          </div>
          : <span>loading...</span>
        }
        { metadata
          ? <div>
            <MetadataList metadata={metadata} />
            <MetadataToGraph metadata={metadata} />
          </div>
          : 'no metadata'
        }
        <div>
          {fileText}
        </div>
      </div>
    )
  }
}

class MetadataToGraph extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      graph: null
    }
  }

  render () {
    return (
      <div> some content</div>
    )
  }
}

const MetadataList = function ({ metadata }) {
  // <ul>
  //   { Object.keys(metadata).map(key => <li key={key}>{key}: {metadata[key]}</li>) }
  // </ul>
  const { picture, ...rest } = metadata
  // console.log(picture)
  return (
    <div className='flex flex-column'>
      <img src={picture} className='w-1/2' />
      <List items={Object.keys(rest).map(key => <div><strong>{key}:</strong> {rest[key]}</div>)} />
    </div>
  )
}

// pause symbol with blue bg '\u23F8'

/*
const AudioControls = (props) => {
  let { onPlay, onStop, duration, onSliderMove, onPositionChange, onMute, onVolumeChange, onFullVol, ...rest } = props
  return (
    <div {...rest} className={cls(rest, 'ctrl')}>
      <Button onClick={onPlay}> &#9654; </Button>
      <Button onClick={onStop}> &#9632; </Button>
      <input type='range'
        min='0' max={duration}
        onChange={onPositionChange}
      />
      <Button onClick={onMute}> &#128266; </Button>
      <Button onClick={onFullVol}> &#128264; </Button>
      <input type='range'
        default='100'
        onChange={onVolumeChange}
      />
    </div>
  )
}
*/

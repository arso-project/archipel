'use strict'
import React from 'react'
// import { AudioControls } from '@archipel/ui'
import { Button } from '@archipel/ui'
import './AudioControls.css'
import { MdPause, MdPlayArrow, MdStop, MdVolumeUp, MdVolumeMute } from 'react-icons/md'
import { TextDecoder } from 'text-encoding'

export default {
  name: 'audio-player',
  plugin
}

async function plugin (core) {
  core.components.add('fileViewer', AudioPlayer, {
    stream: false,
    match: ({ mimetype }) => {
      return mimetype && mimetype.match(/audio\/.*/)
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
    let metadata = extractMetadata(this.props.content.subarray(0, 200))
    this.setState({ metadata })
    this.createAudioContext()
  }

  createAudioContext () {
    const audioCtx = new AudioContext() || new webkitAudioContext()
    audioCtx.suspend()
    audioCtx.createMediaElementSource(this.playerRef.current)
    let gainNode = audioCtx.createGain()
    // let source = audioCtx.createBufferSource()
    audioCtx.decodeAudioData(this.props.content.buffer, (buffer) => {
      this.setState({ audioCtx, gainNode, buffer, duration: buffer.duration, loaded: true })
      this.positionControl(0)
    }, (err) => { console.log('Error decoding audio data:', err) })
  }

  componentDidUpdate (prevProps) {
    if (prevProps.content !== this.props.content) {
      console.log(prevProps)
      console.log(this.props)
      this.setState({ loaded: false })
      this.onStop()
      let metadata = extractMetadata(this.props.content.subarray(0, 1000))
      this.setState({ metadata })
      this.createAudioContext()
    }
  }

  componentWillUnmount () {
    let { source } = this.state
    source.stop()
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
    console.log(metadata)
    let symSize = 24
    return (
      <div className='flex flex-col'>
        { metadata ?
          <MetadataList metadata={metadata} />
          : 'no metadata'
        }
        <audio ref={this.playerRef} />
        { loaded ?
          <div className='ctrl'>
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
          : <span>loading...</span> }
        <div>
          {fileText}
        </div>
      </div>
    )
  }
}

const MetadataList = ({ metadata }) => (
  <ul>
    { Object.keys(metadata).map(key => <li>{key}: {metadata[key]}</li>) }
  </ul>
)

const extractMetadata = function (uint8array) {
  let formatIdentifier = uint8ToHex(uint8array.slice(0, 4))
  if (formatIdentifier.slice(0, 6) === '494433') return extractID3v2Tags(uint8array)
  if (formatIdentifier === '4F676753') return extractVorbisComments(uint8array)
  if (formatIdentifier.slice(0, 4) === 'FFFB') return extractID3v1Tags(uint8array)
  return null
}

const extractVorbisComments = function (uint8array) {
  return null
}

const extractID3v1Tags = function (uint8array) {
  return null
}

const extractID3v2Tags = function (uint8array) {
  console.log(uint8array)
  // let title = rawText.match(/TT2(.*)TP1/)[0].slice(3, -3).replace(/\u0000/g, '')
  // let interpreter = rawText.match(/TP1(.*)TAL/)[0].slice(3, -3).replace(/\u0000/g, '')
  // let album = rawText.match(/TAL(.*)TYE/)[0].slice(3, -3).replace(/\u0000/g, '')
  // let year = rawText.match(/TYE(.*)PIC/)[0].slice(3, -3).replace(/\u0000/g, '')
  // return { title, interpreter, album, year }
  let latin1 = uint8ToLatin1(uint8array)
  let frames = {
    type:     { id: 'TT1', content: null },
    title:    { id: 'TT2', content: null },
    subtitle: { id: 'TT3', content: null },
    lead:     { id: 'TP1', content: null },
    band:     { id: 'TP2', content: null },
    conductor: { id: 'TP3', content: null },
    modifier: { id: 'TP4', content: null },
    composer: { id: 'TCM', content: null },
    lyricists: { id: 'TXT', content: null },
    language: { id: 'TLA', content: null },
    genre:    { id: 'TCO', content: null },
    album:    { id: 'TAL', content: null },
    part:     { id: 'TPA', content: null },
    track:    { id: 'TRK', content: null },
    isrc:     { id: 'TRC', content: null },
    year:     { id: 'TYE', content: null },
    date:     { id: 'TDA', content: null },
    time:     { id: 'TIM', content: null },
    recordDate: { id: 'TRD', content: null },
    mediaType: { id: 'TMT', content: null },
    origReleased: { id: 'TOR', content: null }
  }
  let metadata = {}
  let length = 0
  let match
  let regExID
  for (let key in frames) {
    regExID = new RegExp(frames[key].id)
    match = regExID.exec(latin1)
    if (!match) continue
    length = uint8array.slice(match.index + 5, match.index + 6)[0]
    console.log(regExID, match, length)
    frames[key].content = latin1.slice(match.index + 6, match.index + 6 + length).replace(/\0/g, '')
    if (frames[key].content) metadata[key] = frames[key].content
    console.log(frames[key].content)
  }
  return metadata
}

const uint8ToHex = function (byteArray) {
  return byteArray.map(x => ('00' + x.toString(16)).slice(-2)).join('')
}

const uint8ToLatin1 = function (byteArray) {
  let latin1 = new TextDecoder('iso-8859-2')
  return latin1.decode(byteArray)
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

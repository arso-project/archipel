'use strict'
import { TextDecoder } from 'text-encoding'

export function metadataExtractor (audioUint8Array) {
  let formatIdentifier = uint8ToHex(audioUint8Array.slice(0, 4))
  if (formatIdentifier.slice(0, 6) === '494433') return extractID3v2Tags(audioUint8Array)
  if (formatIdentifier === '4F676753') return extractVorbisComments(audioUint8Array)
  if (formatIdentifier.slice(0, 4) === 'FFFB') return extractID3v1Tags(audioUint8Array)
  return null
}

const extractVorbisComments = function (uint8array) {
  return null
}

const extractID3v1Tags = function (uint8array) {
  return null
}

const extractID3v2Tags = function (uint8array) {
  const headerLength = 10
  const header = uint8array.slice(0, headerLength)
  if (header.slice(0, 3).toString() !== '73,68,51') {
    console.warn('No ID3 tag recognised')
    return null
  }
  const subVersion = header.slice(3, 4)
  const tagSize = calcID3v2size(header.slice(6, headerLength))
  uint8array = uint8array.slice(headerLength, headerLength + tagSize)

  let frames
  let frameIDN
  let frameSizeN
  let frameFlagsN

  switch (subVersion[0]) {
    case 2:
      frames = id3v22Frames
      frameIDN = 3 // bytes
      frameSizeN = 3 // bytes
      frameFlagsN = 0
      break
    case 3:
      frames = id3v23Frames
      frameIDN = 4 // bytes
      frameSizeN = 4 // bytes
      frameFlagsN = 2
      break
    case 4:
      frames = id3v23Frames
      frameIDN = 4 // bytes
      frameSizeN = 4 // bytes
      frameFlagsN = 2
      break
    default:
      console.warn('Unkown ID3tag version:', subVersion)
      return null
  }
  const frameHeadN = frameIDN + frameSizeN + frameFlagsN

  let metadata = {}
  let id = ''
  let frameSize
  let here = 0

  while (here < (tagSize)) {
    frameSize = guessFrameSize(uint8array.slice(here + frameIDN, here + frameIDN + frameSizeN))
    if (!frameSize) break
    id = latin1Decoder.decode(uint8array.slice(here, here + frameIDN))
    // if (id === 'PIC' || id === 'APIC') {
    //   here += frameHeadN + frameSize
    //   continue
    // }
    if (!frames[id]) {
      here += frameHeadN + frameSize
      continue
    }
    if (id === 'PIC' || id === 'APIC')  {
      frames[id].content = readPicFrame(
        uint8array.slice(here, here + frameHeadN), // frame head
        uint8array.slice(here + frameHeadN, here + frameHeadN + frameSize) // frame content
      )
    } else {
      frames[id].content = readFrame(
        uint8array.slice(here, here + frameHeadN), // frame head
        uint8array.slice(here + frameHeadN, here + frameHeadN + frameSize) // frame content
      )
    }
    metadata[frames[id].id] = frames[id].content
    here += frameHeadN + frameSize
  }
  return metadata
  /*
  for (let key in frames) {
    regExID = new RegExp(frames[key].id)
    match = regExID.exec(tags)
    if (!match) continue
    frameSize = guessFrameSize(uint8array.slice(match.index + frameIDN, match.index + frameIDN + frameSizeN))
    frames[key].content = readFrame(
      uint8array.slice(match.index, match.index + frameHeadN), // frame head
      uint8array.slice(match.index + frameHeadN, match.index + frameHeadN + frameSize) // frame content
    )

    headUint8 = uint8array.slice(match.index, match.index + frameHeadN)

    if (frames[key].content) metadata[key] = frames[key].content
  }
  */
}

const readFrame = function (head, frame) {
  let decoder
  let frameEncodingBytes = [0]
  let text

  if (frame[1].toString(16) === 'ff' || frame[2].toString(16) === 'ff') {
    frameEncodingBytes = frame.slice(0, 3)
    frame = frame.slice(3, frame.length)
  }

  switch (frameEncodingBytes) {
    case 0:
      decoder = latin1Decoder
      break
    case 1:
      decoder = utf16LeDecoder
      break
    case 2:
      decoder = utf16BeDecoder
      break
    case 3:
      decoder = utf8Decoder
      break
    default:
      decoder = latin1Decoder
  }

  text = decoder.decode(frame)
  text.replace(/\0/g, '')
  return text
}

const readPicFrame = function (head, frame) {
  // let decoder
  // let frameEncodingBytes = [0]
  let pic

  // if (frame[1].toString(16) === 'ff' || frame[2].toString(16) === 'ff') {
  //   frameEncodingBytes = frame.slice(0, 3)
  //   frame = frame.slice(3, frame.length)
  // }
  let jpegHead = new Uint8Array([255, 216, 255])
  let i = 0
  for (i = 0; i < 25; i++) {
    let test = true
    for (let j = 0; j < 3; j++) {
      if (frame[i + j] !== jpegHead[j]) test = false
    }
    // if (frame.slice(i, i + 4) == jpegHead) break
    if (test) break
  }
  if (i === 25) i = 0
  console.log('pic_offset', i)
  pic = bufToBase64(frame.slice(i + 0, frame.length))
  pic = 'data:image/png;base64,' + pic
  return pic
}

const guessFrameSize = function (frameSizeBytes) {
  if (frameSizeBytes.length === 0) return Infinity
  let frameSize = {}
  frameSize.reduced = frameSizeBytes.reduce((sum, x) => sum + x)
  if (Math.max(...frameSizeBytes) === frameSize.reduced) return Number(frameSize.reduced)

  if (frameSizeBytes.length < 4) {
    let tmp = frameSizeBytes
    frameSizeBytes = new Uint8Array([0, 0, 0, 0])
    frameSizeBytes.set(tmp, 4 - tmp.length)
  }
  // .slice(4 - tmp.length, tmp.length)

  let frameSizeView = new DataView(frameSizeBytes.buffer)
  return Number(frameSizeView.getUint32(0))

  /*
  frameSize.long = frameSizeView.getUint32(0) || Infinity
  frameSize.shortA = frameSizeView.getUint16(0) || Infinity
  frameSize.shortB = frameSizeView.getUint16(2) || Infinity
  console.log(frameSize)
  return Math.min(frameSize.long, frameSize.shortA, frameSize.shortB)
  */
}

const calcID3v2size = (uint8array) => {
  let binary = ''
  for (let i in uint8array) {
    binary += uint8array[i].toString(2).padStart(7, '0')
  }

  // convert to binary array and remove starting 0
  binary = binary.split('').map(x => Number(x))
  let i = -1
  while (!binary[++i]) {}
  binary = binary.slice(i, binary.length)

  // convert to decimal
  let decimal = 0
  let length = binary.length
  for (let i = 0; i < length; i++) {
    decimal += 2 ** i * binary.pop()
  }
  return 4 * decimal
}

const uint8ToHex = function (byteArray) {
  return byteArray.map(x => ('00' + x.toString(16)).slice(-2)).join('')
}

const utf8Decoder = new TextDecoder('utf-8')
const utf16LeDecoder = new TextDecoder('utf-16le')
const utf16BeDecoder = new TextDecoder('utf-16be')
const latin1Decoder = new TextDecoder('iso-8859-1')

// Helper functions to convert a buffer to either a UTF8 string or a base64 array.
function bufToBase64 (input) {
  var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  var output = ''
  var chr1, chr2, chr3, enc1, enc2, enc3, enc4
  var i = 0

  while (i < input.length) {
    chr1 = input[i++]
    chr2 = i < input.length ? input[i++] : Number.NaN // Not sure if the index
    chr3 = i < input.length ? input[i++] : Number.NaN // checks are needed here

    enc1 = chr1 >> 2
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4)
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6)
    enc4 = chr3 & 63

    if (isNaN(chr2)) {
      enc3 = enc4 = 64
    } else if (isNaN(chr3)) {
      enc4 = 64
    }
    output += keyStr.charAt(enc1) + keyStr.charAt(enc2) +
      keyStr.charAt(enc3) + keyStr.charAt(enc4)
  }
  return output
}


const id3v22Frames = {
  'TT1': { id: 'type', content: null },
  'TT2': { id: 'title', content: null },
  'TT3': { id: 'subtitle', content: null },
  'TP1': { id: 'lead', content: null },
  'TP2': { id: 'band', content: null },
  'TP3': { id: 'conductor', content: null },
  'TP4': { id: 'modifier', content: null },
  'TCM': { id: 'composer', content: null },
  'TXT': { id: 'lyricist', content: null },
  'TLA': { id: 'language', content: null },
  'TCO': { id: 'genre', content: null },
  'TAL': { id: 'album', content: null },
  'TPA': { id: 'part', content: null },
  'TRK': { id: 'track', content: null },
  'TRC': { id: 'isrc', content: null },
  'TYE': { id: 'year', content: null },
  'TDA': { id: 'date', content: null },
  'TIM': { id: 'time', content: null },
  'TRD': { id: 'record date', content: null },
  'TMT': { id: 'media type', content: null },
  'TOR': { id: 'original release date', content: null },
  'PIC': { id: 'picture', content: null }
}

const id3v23Frames = {
  'TIT1': { id: 'type', content: null },
  'TIT2': { id: 'title', content: null },
  'TIT3': { id: 'subtitle', content: null },
  'TPE1': { id: 'lead', content: null },
  'TPE2': { id: 'band', content: null },
  'TPE3': { id: 'conductor', content: null },
  'TPE4': { id: 'modifier', content: null },
  'TCOM': { id: 'composer', content: null },
  'TEXT': { id: 'lyricist', content: null },
  'TLAN': { id: 'language', content: null },
  'TCON': { id: 'genre', content: null },
  'TALB': { id: 'album', content: null },
  'TPOS': { id: 'part', content: null },
  'TRCK': { id: 'track', content: null },
  'TSRC': { id: 'isrc', content: null },
  'TYER': { id: 'year', content: null },
  'TDAT': { id: 'date', content: null },
  'TIME': { id: 'time', content: null },
  'TRDA': { id: 'record date', content: null },
  'TMED': { id: 'media type', content: null },
  'TORY': { id: 'original release date', content: null },
  'APIC': { id: 'picture', content: null }
}
/*
const id3v23Frames = {
  'TIT1':     { id: 'type', content: null },
  'TIT2':    { id: 'title', content: null },
  'TIT3': { id: 'subtitle', content: null },
  'TPE1':     { id: 'lead', content: null },
  'TPE2':     { id: 'band', content: null },
  'TPE3': { id: 'conductor', content: null },
  modifier: { id: 'TPE4', content: null },
  composer: { id: 'TCOM', content: null },
  lyricists: { id: 'TEXT', content: null },
  language: { id: 'TLAN', content: null },
  genre:    { id: 'TCON', content: null },
  album:    { id: 'TALB', content: null },
  bpm:      { id: 'TBPM', content: null },
  part:     { id: 'TPOS', content: null },
  track:    { id: 'TRCK', content: null },
  isrc:     { id: 'TSRC', content: null },
  year:     { id: 'TYER', content: null },
  date:     { id: 'TDAT', content: null },
  time:     { id: 'TIME', content: null },
  recordDate: { id: 'TRDA', content: null },
  mediaType: { id: 'TMED', content: null },
  origReleased: { id: 'TORY', content: null }
}

/*
const id3v22Frames = {
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

const id3v23Frames = {
  type:     { id: 'TIT1', content: null },
  title:    { id: 'TIT2', content: null },
  subtitle: { id: 'TIT3', content: null },
  lead:     { id: 'TPE1', content: null },
  band:     { id: 'TPE2', content: null },
  conductor: { id: 'TPE3', content: null },
  modifier: { id: 'TPE4', content: null },
  composer: { id: 'TCOM', content: null },
  lyricists: { id: 'TEXT', content: null },
  language: { id: 'TLAN', content: null },
  genre:    { id: 'TCON', content: null },
  album:    { id: 'TALB', content: null },
  bpm:      { id: 'TBPM', content: null },
  part:     { id: 'TPOS', content: null },
  track:    { id: 'TRCK', content: null },
  isrc:     { id: 'TSRC', content: null },
  year:     { id: 'TYER', content: null },
  date:     { id: 'TDAT', content: null },
  time:     { id: 'TIME', content: null },
  recordDate: { id: 'TRDA', content: null },
  mediaType: { id: 'TMED', content: null },
  origReleased: { id: 'TORY', content: null }
}
*/

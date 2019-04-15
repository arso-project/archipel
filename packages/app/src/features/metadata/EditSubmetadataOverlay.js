import React from 'react'
import { MetadataEditor } from './MetadataEditor'
import { Modal } from '@archipel/ui'

export function EditMetadataOverlay (props) {
  const { archive, type, literal } = props

  /*
    TODO: find good UID for arbitrary resources
      include discovery key? maybe not since,
        Max Mustermann is Max Mustermann with respect
        to arbitrary archives.
      include literal name, such as 'Max Mustermann' or 'Kiel'
        yes, but there are several Max Mustermanns and Kiel's around
      include type? yes, at least provides more context,
        but does not resolve above ambiguity
  */
  const ID = archive + type + literal
  console.log('Submeta called with', props)

  return (
    <>
      <Modal toggle={literal}>
        <MetadataEditor ID={ID} {...props} />
      </Modal>
    </>
  )
}
import React from 'react'
import PropTypes from 'prop-types'
import { Heading } from '@archipel/ui'
import RpcQuery from '@archipel/app/src/features/util/RpcQuery.js'

const GraphScreen = (props) => {
  const { archive } = props
  return (
    <div>
      <Heading>Graph test</Heading>
      <RpcQuery
        archive={archive}
        fetch={({ archive }) => ['graph/test', { key: archive }]}
        shouldRefetch={(prevProps, props) => prevProps.archive !== props.archive}
      >
        {(data) => {
          return (
            <div>
              <Heading>Results</Heading>
              <pre>{JSON.stringify(data.data, 0, 2)}</pre>
            </div>
          )
        }}
      </RpcQuery>
    </div>
  )
}

GraphScreen.propTypes = {
  archive: PropTypes.string,
  file: PropTypes.string
}

export default GraphScreen

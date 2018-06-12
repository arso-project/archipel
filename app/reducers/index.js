'use strict'

const defaultState = {
  title: 'Hello',
  counter: 0
}

const ArchipelApp = (state = defaultState, action) => {
  switch (action.type) {
    case 'SET_TITLE':
      return {
        ...state,
        title: action.title
      }
    case 'INCREMENT':
      return {
        ...state,
        counter: state.counter + 1
      }
    default:
      return state
  }
}

export default ArchipelApp

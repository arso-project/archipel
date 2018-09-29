const SET_UI_SCREEN = 'SET_UI_SCREEN'

export const setScreen = screen => ({
  type: SET_UI_SCREEN,
  payload: screen
})

const defaultState = {
  ui: {
    screen: 'archives'
  }
}

const reducer = (state, action) => {
  if (!state.ui) state = { ...state, ...defaultState }

  switch (action.type) {
    case SET_UI_SCREEN:
      return {...state, ui: { ...state.ui, screen: action.payload }}
  }

  return state
}

export default {
  reducer
}

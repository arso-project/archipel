const SET_UI_SCREEN = 'SET_UI_SCREEN'

const KEY = 'app'

export const setScreen = screen => ({
  type: SET_UI_SCREEN,
  payload: screen
})

const initialState = {
  ui: {
    screen: 'archives'
  }
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_UI_SCREEN:
      return {...state, ui: { ...state.ui, screen: action.payload }}
  }

  return state
}

export default {
  namespace: KEY,
  reducer
}

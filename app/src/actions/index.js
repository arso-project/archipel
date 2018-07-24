import rpc from './../api/rpc'

// Simple actions.

export const setTitle = title => ({ type: 'SET_TITLE', title })
export const setScreen = screen => ({ type: 'SET_UI_SCREEN', screen })
export const uiTree = (path, props) => ({ type: 'SET_UI_TREE', path, props })

// Thunky actions.

export const query = (key, query) => (dispatch) => {
  const triples = []
  rpc((api) => api.query(key, query, (err, rs) => {
    if (err) return
    rs.on('data', (triple) => triples.push(triple))
    rs.on('end', () => dispatch({ type: 'TRIPLES_LOAD', triples: triples }))
  }))
}

export const loadArchives = (x) => (dispatch) => {
  rpc((api) => {
    api.archives((err, archives) => {
      // todo: handle err.
      if (err) return
      dispatch({ type: 'ARCHIVES_LOAD', archives: archives })
    })
  })
}

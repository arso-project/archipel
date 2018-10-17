export default {
  name: 'app',
  plugin: async (core) => {
    core.makeStore('app', store)
  }
}

const store = {
  initialState: {
    screen: 'archives'
  },
  actions: {
    setScreen: (screen) => { this.draft.screen = screen }
  }
}

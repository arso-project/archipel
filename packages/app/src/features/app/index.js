export default {
  name: 'app',
  plugin: async (core) => {
    core.makeStore('app', store)
  }
}

const store = {
  initialState: {
    screen: 'archives',
    chrome: true
  },
  actions: {
    setScreen: (screen) => { this.draft.screen = screen },
    setChrome: (chrome) => { this.draft.chrome = chrome }
  }
}

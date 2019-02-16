const config = {
  server: {
    port: process.env.NODE_PORT || 8080,
    static: process.env.ARCHIPEL_STATIC_PATH || '../app/dist'
  },
  library: {
    path: process.env.ARCHIPEL_DB_PATH || '.db'
  }
}

module.exports = config


const config = {
  server: {
    port: process.env.PORT || 8080,
    static: process.env.ARCHIPEL_STATIC_PATH || '../frontend/dist'
  },
  library: {
    path: process.env.ARCHIPEL_DB_PATH || '.db'
  }
}

module.exports = config


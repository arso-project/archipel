const config = {
  server: {
    port: process.env.NODE_PORT || process.env.PORT || 8080,
    host: process.env.NODE_HOST || '127.0.0.1',
    static: process.env.ARCHIPEL_STATIC_PATH || '../app/dist'
  },
  library: {
    path: process.env.ARCHIPEL_DB_PATH || '.db'
  }
}

module.exports = config

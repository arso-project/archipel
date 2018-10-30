const boot = require('./boot')

boot()

process.on('unhandledRejection', (error, p) => {
  throw error
  // console.log('Unhandled Rejection at: Promise', p, 'reason:', error)
})

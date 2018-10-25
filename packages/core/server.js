const boot = require('./boot')

boot()

process.on('unhandledRejection', (error, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', error)
})

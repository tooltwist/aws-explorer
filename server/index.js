const express = require('express')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const app = express()

// const api = require('./api')

import graphRouter from './api/graphApi'

// const host = process.env.HOST || '127.0.0.1'
// const port = process.env.PORT || 3000

// app.set('port', port)

// var router = express.Router()

// // middleware that is specific to this router
// router.use(function timeLog (req, res, next) {
//   console.log('Time: ', Date.now())
//   next()
// })
// // define the home page route
// router.get('/', function (req, res) {
//   res.send('Birds home page')
// })

// var birds = require('./birds')
app.use('/api', graphRouter)

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
config.dev = process.env.NODE_ENV !== 'production'

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)
  const { host, port } = nuxt.options.server

  await nuxt.ready()

  // console.log(`nuxt.$axios=`, nuxt.$axios)

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  }

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  // console.log(`Starting Server`)
  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
  // app.listen(port, host, function (e) {
  //   if (e) {
  //     console.log(`Error starting server:`, e)
  //     process.exit(1)
  //   }
  //   console.log('Mah Server listening on ' + host + ':' + port) // eslint-disable-line no-console
  // })
}
start()
import express from 'express';
//const express = require('express')

// import { Router } from 'express'

// import users from './users'
// import graphApi from './graphApi'

// // Add USERS Routes
// const router = Router()
// console.log(`YARP setting up users route`)
// router.use(users)
// console.log(`YARP setting up graphApi`)
// router.use(graphApi)

var router = express.Router()

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
})
// define the home page route
router.get('/', function (req, res) {
  res.send('Birds home page')
})



export default router



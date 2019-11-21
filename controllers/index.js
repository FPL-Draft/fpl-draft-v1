const express = require('express')
const router = express.Router()
const { Team } = require('../db/models')

const TeamRoutes = require('./Team')
// const ApiRoutes = require('./api')

router.get('/', async (req, res, next) => {
  const teams = await Team.scope('withResults').findAll()
  res.render('index', { teams: teams })
})

router.use('/team', TeamRoutes)
// router.use('/season', SeasonRoutes)
// router.use('/api', ApiRoutes)

module.exports = router
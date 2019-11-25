const express = require('express')
const router = express.Router()
const { Team } = require('../db/models')

const TeamRoutes = require('./Team')
const MatchRoutes = require('./Match')
// const ApiRoutes = require('./api')

router.get('/', (req, res, next) => {
  Team.scope('withStats').findAll()
    .then(teams => {
      res.render('index', { teams: teams })
    })
})

router.use('/team', TeamRoutes)
router.use('/match', MatchRoutes)

module.exports = router
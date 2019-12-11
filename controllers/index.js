const express = require('express')
const router = express.Router()
const { Team } = require('../models')
const render = require('../helpers/Twing')

const TeamRoutes = require('./Team')
const MatchRoutes = require('./Match')
const PlayerRoutes = require('./Player')
const ApiRoutes = require('./api')

router.get('/', (req, res, next) => {

  Team.scope('withStats').findAll()
    .then(teams => {
      render(res, 'index', { teams: teams })
    })
})

router.use('/team', TeamRoutes)
router.use('/match', MatchRoutes)
router.use('/players', PlayerRoutes)
router.use('/api', ApiRoutes)

module.exports = router

const express = require('express');
const router = express.Router();

const { Team } = require('../db/models')

router.get('/gameweek/:gameweek', (req, res) => {
  const { gameweek } = req.params
  Team.scope({ method: ['withStats', gameweek] }).findAll()
    .then(teams => {
      res.render('index', { teams: teams })
    })
})

module.exports = router

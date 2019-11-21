const express = require('express');
const router = express.Router();

const { Team } = require('../db/models')

router.get('/:teamId', (req, res) => {
  const { teamId } = req.params
  Team.scope('withResults').findByPk(teamId)
    .then(team => {
      res.render('team', { team: team })
    })
})

module.exports = router
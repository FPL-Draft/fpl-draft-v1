const express = require('express');
const router = express.Router();

const { Team } = require('../db/models')

router.get('/:teamId', async (req, res) => {
  const { teamId } = req.params

  try {
    const team = await Team.findByPk(teamId)
    const matches = await team.getMatchResults()

    res.render('team', {
      team, matches
    })
  } catch (e) {
    res.render('errors/404')
  }

})

module.exports = router
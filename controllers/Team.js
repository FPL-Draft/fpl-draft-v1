const express = require('express');
const router = express.Router();

const { Team, ready } = require('../db/models')

router.get('/:teamId', async (req, res) => {
  const { teamId } = req.params

  try {
    await ready;
    const team = await Team.scope('withStats').findByPk(teamId)
    const matches = await team.getMatchResults()


    res.render('team', {
      team: team,
      matches: matches,
      form: team.getForm(),
    })
  } catch (e) {
    res.render('errors/404')
  }

})

module.exports = router
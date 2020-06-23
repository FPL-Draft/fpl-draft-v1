const express = require('express');
const router = express.Router();
const render = require('../helpers/Twing')

const { Team, ready } = require('../models')

router.get('/:teamId', async (req, res) => {
  sess = req.session
  const { teamId } = req.params

  try {
    await ready;
    const team = await Team.findByPkWithStats(teamId)
    const matches = await team.getMatchResults()

    render(res, 'team', {
      team: team,
      matches: matches,
      admin: sess.admin
    })
  } catch (e) {
    render(res, 'errors/404')
  }

})

module.exports = router
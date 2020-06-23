const express = require('express');
const _ = require('lodash')
const router = express.Router();

const { Team, Match, MatchResult } = require('../../models');
const { request } = require('express');

router.get('/gameweeks/tables', async (req, res) => {
  const matches = await Match.scope('justGameweeks').findAll()

  const tables = []

  for (const { gameweek } of matches) {
    const table = await Team.scope({ method: ['withStats', gameweek] }).findAll()
    const minPoints = table.reduce((min, p) => p.getFplPoints() < min ? p.getFplPoints() : min, table[0].getFplPoints())
    const maxPoints = table.reduce((min, p) => p.getFplPoints() > min ? p.getFplPoints() : min, table[0].getFplPoints())
    const minLeaguePoints = table.reduce((min, p) => p.getTotalPoints() < min ? p.getTotalPoints() : min, table[0].getTotalPoints())
    const maxLeaguePoints = table.reduce((min, p) => p.getTotalPoints() > min ? p.getTotalPoints() : min, table[0].getTotalPoints())
    tables.push({
      minPoints, maxPoints, minLeaguePoints, maxLeaguePoints, gameweek, table
    })
  }
  res.send(tables)
})

router.get("/login", async (req, res) => {
  sess = req.session
  sess.admin = true
  res.send("success")
})

router.post("/update/:matchId", async (req, res) => {
  sess = req.session
  if (sess.admin) {
    const { matchId } = req.params
    const match = await MatchResult.findByPk(matchId)
    const { points } = req.body
    match.points = points
    match.save()
    return res.redirect(`/team/${match.Team.id}`)
  } else {
    return res.redirect("/")
  }
})

module.exports = router

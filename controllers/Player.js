const express = require('express');
const router = express.Router();

const { Player, PlayerStats } = require('../models')

router.get('/', (req, res) => {
  Player.findAll()
    .then(players => {
      res.render('players', { players: players })
    })
})

router.get('/:playerId', (req, res) => {
  const { playerId } = req.params

  PlayerStats.findAll({
    where: {
      PlayerId: playerId
    }
  }).then(playerStats => {
    res.render('player', { playerStats: playerStats });
  })
})

module.exports = router

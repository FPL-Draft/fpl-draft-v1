const axios = require('axios');
const { Op } = require('sequelize');
const { MatchResult, Match, Team, Player, Pick, PlayerStats, Club, ready } = require('./models');

if (process.env.import === 'test') {
  // Team.scope('withResults').findAll()
  //   .then(teams => {
  //     teams.map(team => {
  //       console.log(team.getTotal())
  //     })
  //   })
  // const missingMatches = await MatchResult.findMissing()
}

const updatePoints = async (newResult, gameweek) => {
  if (gameweek > 47)
    return
  let points = 0
  const { entry_id } = await newResult.getTeam() 
  try {
    const response = await axios.get(`https://draft.premierleague.com/api/entry/${entry_id}/event/${gameweek}`);
    const { picks } = response.data
    await Promise.all(picks.map( async pick => {
      const played = (pick.position < 12)
      await Pick.create({
          PlayerId: pick.element,
          MatchResultId: newResult.id,
          played: played
      }).then(async newPick => {
        // Get player stats for game
        if (newPick.played) {
          const player = await Player.findOne({ where: { player_id: newPick.PlayerId }})
          const matchStats = await PlayerStats.findAll({ where: {
            PlayerId: player.id,
            gameweek: gameweek
          }})
          matchStats.map(stat => {
            points += stat.points
          })
        }
      });
    }));
    newResult.points = points
    newResult.save()
  } catch(e) {

  }
  
  newResult.points = points
  newResult.update()
}


const executeTeams = async () => {
  console.log('executeTeams');
  const response = await axios.get('https://draft.premierleague.com/api/league/35400/details')
  const { league_entries } = response.data;
  console.log('before:teams')
  await Promise.all(league_entries.map(async entry => {
    return Team.create({
      team_id: entry.id,
      entry_id: entry.entry_id,
      name: entry.entry_name,
      manager: `${entry.player_first_name} ${entry.player_last_name}`
    })
  }))
  console.log('after:teams')
}

const executeMatches = async () => {
  console.log('executeMatches');
  const response = await axios.get('https://draft.premierleague.com/api/league/35400/details')
  const { matches } = response.data;
  console.log('before:matches');
  await Promise.all(matches.map(async (fplMatch) => {
    await Match.create({
      gameweek: fplMatch.event,
      finished: fplMatch.finished
    }).then(async match => {
      const homeTeam = await Team.findOne({
        where: {
          team_id: fplMatch.league_entry_1
        }
      })
      const homeResult = await MatchResult.create({
        points: fplMatch.league_entry_1_points,
        TeamId: homeTeam.id,
        MatchId: match.id
      })

      const awayTeam = await Team.findOne({
        where: {
          team_id: fplMatch.league_entry_2
        }
      })
      const awayResult = await MatchResult.create({
        points: fplMatch.league_entry_2_points,
        TeamId: awayTeam.id,
        MatchId: match.id,
        OpponentId: homeResult.id
      })

      await homeResult.update({ OpponentId: awayResult.id });
    })
  }));
  console.log('after:matches');
}

const executeClubs = async () => {
  console.log('executeClubs');
  const response = await axios.get('https://fantasy.premierleague.com/api/bootstrap-static/')
  const { teams } = response.data;
  console.log('before:clubs')
  await Promise.all(teams.map(async club => {
    await Club.create({
      club_id: club.id,
      name: club.name,
      strength_overall_home: club.strength_overall_home,
      strength_overall_away: club.strength_overall_away,
      strength_attack_home: club.strength_attack_home,
      strength_attack_away: club.strength_attack_away,
      strength_defence_home: club.strength_defence_home,
      strength_defence_away: club.strength_defence_away
    })
  }))
  console.log('after:clubs')
}

const executePlayers = async () => {
  console.log('executePlayers');
  const fantasyResponse = await axios.get('https://fantasy.premierleague.com/api/bootstrap-static/')
  const { elements: fantasyElements } = fantasyResponse.data
  const response = await axios.get('https://draft.premierleague.com/api/bootstrap-static')
  const { elements } = response.data;
  console.log('before:players')
  await Promise.all(elements.map(async (player) => {
    const fantasyPlayer = fantasyElements.find(fantasyPlayer => player.code == fantasyPlayer.code)
    if (fantasyPlayer) {
      await Player.create({
        player_id: player.id,
        points: player.total_points,
        assists: player.assists,
        goals: player.goals_scored,
        first_name: player.first_name,
        second_name: player.second_name,
        name: player.web_name,
        price: fantasyPlayer.now_cost,
        selectedBy: fantasyPlayer.selected_by_percent,
        club_id: fantasyPlayer.team
      })
    }
  }))
  console.log('after:players');
}

const executePicks = async () => {
  console.log('executePicks');
  const matchResults = await MatchResult.findAll()
  console.log('before:picks')
  await Promise.all(matchResults.map(async result => {
    const { Team, Match } = result;
    const response = await axios.get(`https://draft.premierleague.com/api/entry/${Team.entry_id}/event/${Match.gameweek}`);
    const { picks, subs } = response.data;
    await Promise.all(picks.map( async pick => {
      const played = (pick.position < 12)
      await Pick.create({
          PlayerId: pick.element,
          MatchResultId: result.id,
          played: played
      });
    }));

  }))
  console.log('after:picks')
}

const executePlayerStats = async () => {
  console.log('executePlayerStats');

  const players = await Player.findAll()
  console.log('before:playerstats')
  await Promise.all(players.map(async player => {
    const response = await axios.get(`https://draft.premierleague.com/api/element-summary/${player.player_id}`);
    const { history } = response.data;

    await Promise.all(history.map(async (game) => {
      await PlayerStats.create({
        points: game.total_points,
        assists: game.assists,
        goals: game.goals_scored,
        detail: game.detail,
        gameweek: game.event,
        PlayerId: player.id
      })
    }))
  }))
  console.log('after:playerstats')
}

const fixPrem = async () => {
  console.log('fixPrem')
  // Duplicate final matches
  const newMatches = await Match.findAll({
    where: {
      gameweek: { [Op.gt]: 29 }
    }
  })
  await Promise.all(newMatches.map(async match => {
    const results = match.MatchResults
    const gameweek = match.gameweek + 9
    await Match.create({
      gameweek: gameweek,
      finished: true
    }).then( async newMatch => {
      const homeResult = await MatchResult.create({
        points: 0, // calcualte if possible
        TeamId: results[0].TeamId,
        MatchId: newMatch.id,
      })

      const awayResult = await MatchResult.create({
        points: 0, // calcualte if possible
        TeamId: results[1].TeamId,
        MatchId: newMatch.id,
        OpponentId: homeResult.id
      })

      await homeResult.update({ OpponentId: awayResult.id });
      await updatePoints(homeResult, gameweek)
      await updatePoints(awayResult, gameweek)
    })
  }))
}

const execute = async () => {
  await executeTeams();
  await executeMatches();
  await executeClubs();
  await executePlayers();
  await executePicks();
  await executePlayerStats();
  await fixPrem();
}

if (process.env.TEST) {
  execute();
} else {
  ready.
    then(() => {
      execute();
    })
}

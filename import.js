const axios = require('axios');
const { sequelize, Team, Match, MatchResult, Player, Pick } = require('./db/database');


axios.get('https://draft.premierleague.com/api/league/35400/details')
  .then(async (response) => {
    const { league_entries, matches } = response.data;
    if (process.env.import === 'teams') {
      await league_entries.map(async (entry) => {
        await Team.create({
          team_id: entry.id,
          entry_id: entry.entry_id,
          name: entry.entry_name
        })
      });
    } else if (process.env.import === 'matches') {
      matches.map(async (fplMatch) => {
        Match.create({
          gameweek: fplMatch.event,
          finished: fplMatch.finished
        }).then(async match => {
          const homeTeam = await Team.findOne({
            where: {
              team_id: fplMatch.league_entry_1
            }
          })
          MatchResult.create({
            points: fplMatch.league_entry_1_points,
            teamId: homeTeam.id,
            matchId: match.id
          })
          const awayTeam = await Team.findOne({
            where: {
              team_id: fplMatch.league_entry_2
            }
          })
          MatchResult.create({
            points: fplMatch.league_entry_2_points,
            teamId: awayTeam.id,
            matchId: match.id
          })
        })
      });
    }
  })
  .catch(error => {
    console.log(error);
  });

if (process.env.import === 'players') {
  axios.get('https://draft.premierleague.com/api/bootstrap-static')
    .then(async (response) => {
      const { elements } = response.data;
      await elements.map(async (player) => {
        Player.create({
          player_id: player.id,
          points: player.total_points,
          assists: player.assists,
          goals: player.goals_scored,
          first_name: player.first_name,
          second_name: player.second_name
        })
      });
    })
    .catch(error => {
      console.log(error);
    })
}

if (process.env.import === 'gw') {
  MatchResult.findAll()
    .then(async matchResults => {
      await matchResults.map(async matchResult => {
        const team = await matchResult.getTeam();
        const match = await matchResult.getMatch();
        console.log(`Team: ${team.entry_id} - Gameweek: ${match.gameweek}`);
        if (matchResult.points > 0) {
          axios.get(`https://draft.premierleague.com/api/entry/${team.entry_id}/event/${match.gameweek}`)
            .then(async response => {
              const { picks, subs } = response.data;
              picks.map(pick => {
                Pick.create({
                  player_id: pick.element,
                  matchResultId: matchResult.id
                });
              });
            })
            .catch(e => {
              console.log(e)
            })
        }
      })
    })
}
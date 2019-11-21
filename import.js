const axios = require('axios');
const { Op } = require('sequelize');
// const { sequelize, Team, Match, MatchResult, Player, Pick } = require('./db');
const { MatchResult, Match, Team, Player, Pick } = require('./db/models');

if (process.env.import === 'test') {
  Team.scope('withResults').findAll()
    .then(teams => {
      teams.map(team => {
        console.log(team.getTotal())
      })
    })
}


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
            TeamId: homeTeam.id,
            MatchId: match.id
          })

          const awayTeam = await Team.findOne({
            where: {
              team_id: fplMatch.league_entry_2
            }
          })
          MatchResult.create({
            points: fplMatch.league_entry_2_points,
            TeamId: awayTeam.id,
            MatchId: match.id
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
  MatchResult.scope('withTeamAndMatch').findAll()
    .then(async matchResults => {
      await matchResults.map(result => {
        const { Team, Match } = result;
        console.log(`Team: ${Team.entry_id} - Gameweek: ${Match.gameweek}`);

        axios.get(`https://draft.premierleague.com/api/entry/${Team.entry_id}/event/${Match.gameweek}`)
          .then(async response => {
            const { picks, subs } = response.data;
            picks.map(pick => {
              Pick.create({
                PlayerId: pick.element,
                MatchResultId: result.id
              });
            });
          })
          .catch(e => {
            console.log(e)
          })
      })
    })
}


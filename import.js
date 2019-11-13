const axios = require('axios');
const { sequelize, Team, Match, MatchResult } = require('./db/database');


axios.get('https://draft.premierleague.com/api/league/35400/details')
  .then(async (response) => {
    const { league_entries, matches } = response.data;
    if (process.env.import === 'teams') {
      await league_entries.map(async (entry) => {
        await Team.create({
          team_id: entry.id,
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

const { sequelize, Team, Match, MatchResult } = require('./db/database');

Team.findAll()
	.then(teams => {
		teams.map(team => {
			console.log(team.name);
		})
	})
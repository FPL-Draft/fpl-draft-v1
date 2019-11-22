module.exports = (sequelize, type) => {
  const Team = sequelize.define('Team', {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    team_id: type.INTEGER,
    entry_id: type.INTEGER,
    name: type.STRING,
  }, {

  });

  Team.associate = ({ Team, MatchResult }) => {
    Team.hasMany(MatchResult);
    Team.hasMany(MatchResult.scope('withOpponent'), { as: 'MatchResult' })
  }

  Team.extend = ({ MatchResult }) => {
    /**
     * Instance Methods
     */
    Team.prototype.getTotalPoints = function () {
      if (this.get('totalPoints'))
        return this.get('totalPoints')

      return this.MatchResult.reduce((total, result) => total + result.getDataValue('totalPoints'), 0);
    }

    Team.prototype.getFplPoints = function () {
      if (this.get('fplPoints'))
        return this.get('fplPoints')

      return this.MatchResult.reduce((total, result) => total + result.getDataValue('fplPoints'), 0);
    }

    Team.prototype.getForm = function () {
      if (this.get('form'))
        return this.get('form')
    }

    Team.prototype.getPointsAgaints = function () {
      if (this.get('pointsAgaints'))
        return this.get('pointsAgaints')
    }

    Team.prototype.getPointsDifferene = function () {
      return this.getFplPoints() - this.getPointsAgaints();
    }

    Team.prototype.getWins = function () {
      if (this.get('wins'))
        return this.get('wins')
    }

    Team.prototype.getDraws = function () {
      if (this.get('draws'))
        return this.get('draws')
    }

    Team.prototype.getLosses = function () {
      if (this.get('losses'))
        return this.get('losses')
    }


    /**
     * Class Methods
     */

    /**
     * Class Scopes
     */
    Team.addScope('withResults', {
      include: [
        {
          model: MatchResult.scope('withOpponent'),
          as: 'MatchResult'
        }
      ],
      attributes: [
        'name',
        'entry_id',
        'id',
        [sequelize.literal('CASE WHEN MatchResult.points > `MatchResult->Opponent`.points THEN 3 WHEN MatchResult.points < `MatchResult->Opponent`.points THEN 0 ELSE 1 END'), 'MatchResult.matchPoint'],
        [sequelize.literal('CASE WHEN MatchResult.points > `MatchResult->Opponent`.points THEN "won" WHEN MatchResult.points < `MatchResult->Opponent`.points THEN "lost" ELSE "draw" END'), 'MatchResult.result'],
      ]
    })

    Team.addScope('withStats', {
      attributes: [
        'name',
        'entry_id',
        'id',
        [sequelize.literal('(SELECT sum(points) FROM MatchResults as m WHERE m.TeamId = `Team`.`id`)'), 'fplPoints'],
        [sequelize.literal('(SELECT sum(result) FROM (SELECT CASE WHEN r.points > o.points THEN 3 WHEN r.points < o.points THEN 0 ELSE 1 END as result FROM MatchResults as r INNER JOIN MatchResults as o ON r.matchId = o.matchId AND r.id != o.id WHERE r.teamId = `Team`.`id` AND r.points > 0))'), 'totalPoints'],
        [sequelize.literal('(SELECT avg(points) FROM (SELECT r.points FROM MatchResults as r INNER JOIN matches as m ON r.matchId = m.id INNER JOIN MatchResults as o ON r.matchId = o.matchId AND r.id != o.id WHERE r.teamId = `Team`.`id` AND r.points > 0 ORDER BY gameweek DESC LIMIT 0,5))'), 'form'],
        [sequelize.literal('(SELECT sum(o.points) FROM MatchResults as r INNER JOIN MatchResults as o ON r.matchId = o.matchId AND r.id != o.id WHERE r.TeamId = `Team`.`id`)'), 'pointsAgaints'],
        [sequelize.literal('(SELECT sum(won) FROM (SELECT CASE WHEN r.points > o.points THEN 1 ELSE 0 END as won FROM MatchResults as r INNER JOIN MatchResults as o ON r.matchId = o.matchId AND r.id != o.id WHERE r.teamId = `Team`.`id` AND r.points > 0))'), 'wins'],
        [sequelize.literal('(SELECT sum(won) FROM (SELECT CASE WHEN r.points = o.points THEN 1 ELSE 0 END as won FROM MatchResults as r INNER JOIN MatchResults as o ON r.matchId = o.matchId AND r.id != o.id WHERE r.teamId = `Team`.`id` AND r.points > 0))'), 'draws'],
        [sequelize.literal('(SELECT sum(won) FROM (SELECT CASE WHEN r.points < o.points THEN 1 ELSE 0 END as won FROM MatchResults as r INNER JOIN MatchResults as o ON r.matchId = o.matchId AND r.id != o.id WHERE r.teamId = `Team`.`id` AND r.points > 0))'), 'losses'],
      ],
      order: [
        [sequelize.col('totalPoints'), 'DESC']
      ]
    })
  }

  return Team;
}; 
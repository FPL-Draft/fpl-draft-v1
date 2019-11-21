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
        [sequelize.literal('(SELECT sum(result) FROM (SELECT CASE WHEN r.points > o.points THEN 3 WHEN r.points < o.points THEN 0 ELSE 1 END as result FROM MatchResults as r INNER JOIN MatchResults as o ON r.matchId = o.matchId AND r.id != o.id WHERE r.teamId = `Team`.`id` AND r.points > 0))'), 'totalPoints']
      ],
      order: [
        [sequelize.col('totalPoints'), 'DESC']
      ]
    })
  }

  return Team;
};
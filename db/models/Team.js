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
    Team.prototype.getTotal = function () {
      // console.log(this.MatchResult)
      return this.MatchResult.reduce((total, result) => total + result.getDataValue('matchPoint'), 0);
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
        [sequelize.literal('CASE WHEN MatchResult.points > `MatchResult->Opponent`.points THEN "won" WHEN MatchResult.points < `MatchResult->Opponent`.points THEN "lost" ELSE "draw" END'), 'MatchResult.result']
      ]
    })
  }

  return Team;
};
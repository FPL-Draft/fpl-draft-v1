const { Op } = require('sequelize');
module.exports = (sequelize, type) => {
  const MatchResult = sequelize.define('MatchResult', {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    points: type.INTEGER
  }, {
    defaultScope: {
      where: {
        points: { [Op.gt]: 0 }
      }
    }
  });

  MatchResult.associate = ({ MatchResult, Team, Match, Pick }) => {
    MatchResult.belongsTo(Team);
    MatchResult.belongsTo(Match);
    MatchResult.hasMany(Pick);
    MatchResult.hasOne(MatchResult, {
      as: 'Opponent',
      foreignKey: 'MatchId',
      sourceKey: 'MatchId'
    })
  }

  MatchResult.extend = (model) => {
    /**
     * Instance Methods
     */
    MatchResult.prototype.getOpponent = function () {
      return MatchResult.findOne({
        where: {
          matchId: this.matchId,
          id: {
            [Op.ne]: this.id
          }
        }
      });
    }

    /**
     * Class Methods
     */

    /**
     * Class Scopes
     */
    MatchResult.addScope('withTeam', {
      include: [
        {
          model: model.Team,
        }
      ]
    })

    MatchResult.addScope('withMatch', {
      include: [
        {
          model: model.Match,
        }
      ]
    })

    MatchResult.addScope('withTeamAndMatch', {
      include: [
        {
          model: model.Team,
        },
        {
          model: model.Match,
        }
      ]
    })

    MatchResult.addScope('withOpponent', {
      include: [
        {
          model: model.MatchResult,
          as: 'Opponent',
          where: {
            id: {
              [Op.ne]: sequelize.col('MatchResult.id')
            }
          }
        }
      ]
    })
    MatchResult.addScope('withResults', {
      include: [
        {
          model: model.MatchResult,
          as: 'Opponent',
          where: {
            id: {
              [Op.ne]: sequelize.col('MatchResult.id')
            }
          }
        }
      ],
      attributes: [
        [sequelize.literal('CASE WHEN MatchResult.points > Opponent.points THEN 3 WHEN MatchResult.points < Opponent.points THEN 0 ELSE 1 END'), 'matchPoint'],
        [sequelize.literal('CASE WHEN MatchResult.points > Opponent.points THEN "won" WHEN MatchResult.points < Opponent.points THEN "lost" ELSE "draw" END'), 'result']
      ]
    })
  }


  return MatchResult
};
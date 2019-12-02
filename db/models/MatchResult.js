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
    MatchResult.prototype.getResult = function () {
      if (this.points > this.Opponent.points)
        return 'w'

      if (this.points < this.Opponent.points)
        return 'l'

      return 'd'
    }

    MatchResult.prototype.getResultPoints = function () {
      if (this.points > this.Opponent.points)
        return 3

      if (this.points < this.Opponent.points)
        return 0

      return 1
    }

    /**
     * Class Methods
     */

    /**
     * Class Scopes
     */
    MatchResult.addScope('defaultScope', {
      include: [
        {
          model: model.MatchResult.unscoped(),
          as: 'Opponent',
          where: {
            id: {
              [Op.ne]: sequelize.col('MatchResult.id')
            }
          },
          include: [
            {
              model: model.Team
            }
          ]
        },
        {
          model: model.Team
        },
        {
          model: model.Match
        }
      ],
      where: {
        points: { [Op.gt]: 0 }
      },
      order: [
        [sequelize.col('gameweek'), 'DESC'],
      ]
    }, { override: true })

  }


  return MatchResult
};
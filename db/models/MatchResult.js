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
      as: 'Opponent'
    })
  }

  MatchResult.extend = (models) => {
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

    MatchResult.prototype.getTeamStats = async function () {
      const teams = await models.Team.scope({ method: ['withStats', this.Match.gameweek] }).findAll() // withStats Position only works with findAll
      return teams.find(team => team.id == this.TeamId)
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
          model: models.MatchResult.unscoped(), // if not unscoped it will cuase infinite loop of including MatchResult Opponent
          as: 'Opponent',
          include: [
            {
              model: models.Team
            }
          ]
        },
        {
          model: models.Team
        },
        {
          model: models.Match
        }
      ],
      where: {
        points: { [Op.gt]: 0 }
      },
      order: [
        [sequelize.col('gameweek'), 'DESC'],
      ]
    }, { override: true })

    MatchResult.addScope('withOpponent', {
      include: [
        {
          model: models.MatchResult.unscoped(),
          as: 'Opponent',
        },
        {
          model: models.Match
        }
      ],
      where: {
        points: { [Op.gt]: 0 }
      }
    })
  }


  return MatchResult
};
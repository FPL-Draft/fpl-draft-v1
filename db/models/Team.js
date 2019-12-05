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
  }

  Team.extend = (models) => {
    /**
     * Instance Methods
     */
    Team.prototype.getTotalPoints = function () {
      return this.get('totalPoints')
    }

    Team.prototype.getFplPoints = function () {
      return this.get('fplPoints')
    }

    Team.prototype.getForm = function () {
      return this.get('form')
    }

    Team.prototype.getPointsAgainst = function () {
      return this.get('pointsAgainst')
    }

    Team.prototype.getPointsDifference = function () {
      return this.getFplPoints() - this.getPointsAgainst();
    }

    Team.prototype.getWins = function () {
      return this.get('wins')
    }

    Team.prototype.getDraws = function () {
      return this.get('draws')
    }

    Team.prototype.getLosses = function () {
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
          model: models.MatchResult,
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

    Team.addScope('withStats', (gw = false) => {
      const filter = (gw) ? `AND gameweek <= ${gw}` : `AND 0 < gameweek`;
      const FromMatchResultQuery = `
      MatchResults as r
      INNER JOIN matches as m ON r.matchId = m.id 
      INNER JOIN MatchResults as o ON r.matchId = o.matchId AND r.id != o.id 
      WHERE r.teamId = \`Team\`.\`id\` 
      AND r.points > 0
      ${filter}`;

      return ({
        attributes: [
          'name',
          'entry_id',
          'id',
          [sequelize.literal(`
            (SELECT sum(r.points) 
            FROM ${FromMatchResultQuery})`), 'fplPoints'],
          [sequelize.literal(`
            (SELECT sum(result) 
            FROM (
              SELECT 
                CASE 
                  WHEN r.points > o.points THEN 3 
                  WHEN r.points < o.points THEN 0 
                  ELSE 1 
                END as result 
              FROM ${FromMatchResultQuery}
            ))`), 'totalPoints'],
          [sequelize.literal(`
            (SELECT avg(points) 
            FROM (
              SELECT r.points 
              FROM ${FromMatchResultQuery}
              ORDER BY gameweek DESC LIMIT 0,5
            ))`), 'form'],
          [sequelize.literal(`
            (SELECT sum(o.points) 
            FROM ${FromMatchResultQuery})`), 'pointsAgainst'],
          [sequelize.literal(`
            (SELECT sum(won) 
            FROM (
              SELECT 
                CASE 
                  WHEN r.points > o.points THEN 1 
                  ELSE 0 
                END as won 
              FROM ${FromMatchResultQuery}
            ))`), 'wins'],
          [sequelize.literal(`
            (SELECT sum(draw) 
            FROM (
              SELECT 
                CASE 
                  WHEN r.points = o.points THEN 1 
                  ELSE 0 
                END as draw 
              FROM ${FromMatchResultQuery}
            ))`), 'draws'],
          [sequelize.literal(`
            (SELECT sum(loss) 
            FROM (
              SELECT 
                CASE 
                  WHEN r.points < o.points THEN 1 
                  ELSE 0 
                END as loss 
              FROM ${FromMatchResultQuery}
            ))`), 'losses'],
        ],
        order: [
          [sequelize.col('totalPoints'), 'DESC'],
          [sequelize.col('fplPoints'), 'DESC']
        ]
      })
    })
  }

  return Team;
}; 
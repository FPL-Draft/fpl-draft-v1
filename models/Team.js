const { Op } = require('sequelize');
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
    manager: type.STRING
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

    Team.prototype.getPosition = function () {

      return this.get('position')
    }

    Team.prototype.getFplPoints = function () {
      return this.get('fplPoints')
    }

    Team.prototype.getForm = function () {
      return this.get('form')
    }

    Team.prototype.getAveragePoints = function () {
      return this.get('average')
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
    Team.findByPkWithStats = async function (id) {
      const teams = await models.Team.scope('withStats').findAll() // withStats Position only works with findAll
      return teams.find(team => team.id == id)
    }

    /**
     * Class Scopes
     */
    Team.addScope('withStats', (gw = 100) => {
      const filter = `AND gameweek <= ${gw}`;
      const FromMatchResultQuery = `
      MatchResults as r
      INNER JOIN matches as m ON r.matchId = m.id 
      INNER JOIN MatchResults as o ON r.OpponentId = o.id
      WHERE r.teamId = \`Team\`.\`id\` 
      AND r.points > 0
      AND finished = 1
      ${filter}`;

      return ({
        include: [
          {
            model: models.MatchResult.scope('withOpponent')
          }
        ],
        attributes: [
          'name',
          'entry_id',
          'id',
          'manager',
          [sequelize.literal(`
            row_number() OVER(
              order by 
                SUM(
                  CASE 
                    WHEN \`MatchResults\`.\`points\` > \`MatchResults->Opponent\`.\`points\` THEN 3 
                    WHEN \`MatchResults\`.\`points\` < \`MatchResults->Opponent\`.\`points\` THEN 0 
                    ELSE 1 
                  END) DESC, 
                SUM(\`MatchResults\`.\`points\`) DESC)`), 'position'],
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
            (SELECT avg(r.points) 
            FROM ${FromMatchResultQuery})`), 'average'],
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
        where: {
          '$MatchResults->Match.gameweek$': { [Op.lte]: gw },
          '$MatchResults->Match.finished$': true
        },
        order: [
          [sequelize.col('totalPoints'), 'DESC'],
          [sequelize.col('fplPoints'), 'DESC']
        ],
        group: 'name'
      })
    })
  }

  return Team;
}; 
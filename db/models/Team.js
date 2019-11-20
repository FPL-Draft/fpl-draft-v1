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

  return Team;
};
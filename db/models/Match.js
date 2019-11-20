module.exports = (sequelize, type) => {
  const Match = sequelize.define('Match', {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    gameweek: type.INTEGER,
    finished: type.BOOLEAN
  }, {
    defaultScope: {
      where: {
        finished: true
      }
    }
  });

  Match.associate = ({ Match, MatchResult }) => {
    Match.hasMany(MatchResult);
  }

  return Match;
};
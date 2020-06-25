module.exports = (sequelize, type) => {
  const Pick = sequelize.define('Pick', {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    played: {
      type: type.BOOLEAN
    }
  }, {

  });

  Pick.associate = ({ Pick, Player, MatchResult }) => {
    Pick.belongsTo(Player);
    Pick.belongsTo(MatchResult);
  }

  return Pick;
};
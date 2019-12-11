module.exports = (sequelize, type) => {
  const PlayerStats = sequelize.define('PlayerStats', {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    points: type.INTEGER,
    assists: type.INTEGER,
    goals: type.INTEGER,
    detail: type.STRING,
    gameweek: type.INTEGER

  }, {

  });

  PlayerStats.associate = ({Player}) => {

    PlayerStats.belongsTo(Player);
  }

  return PlayerStats;
};

module.exports = (sequelize, type) => {
  const Player = sequelize.define('Player', {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    player_id: type.INTEGER,
    points: type.INTEGER,
    assists: type.INTEGER,
    goals: type.INTEGER,
    first_name: type.STRING,
    second_name: type.STRING
  }, {

  });

  Player.associate = ({ Pick, PlayerStats }) => {
    Player.hasMany(Pick);
    Player.hasMany(PlayerStats);
  }

  return Player;
};

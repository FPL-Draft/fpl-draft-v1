module.exports = (sequelize, type) => {
  return sequelize.define('player', {
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
  });
};
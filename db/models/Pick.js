module.exports = (sequelize, type) => {
  return sequelize.define('pick', {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    player_id: type.INTEGER
  });
};
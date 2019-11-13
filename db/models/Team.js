module.exports = (sequelize, type) => {
  return sequelize.define('team', {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    team_id: type.INTEGER,
    name: type.STRING,
  });
};
module.exports = (sequelize, type) => {
  return sequelize.define('match', {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    gameweek: type.INTEGER,
    finished: type.BOOLEAN
  });
};
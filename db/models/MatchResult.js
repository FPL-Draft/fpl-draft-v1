module.exports = (sequelize, type) => {
  return sequelize.define('match_result', {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    points: type.INTEGER
  });
};
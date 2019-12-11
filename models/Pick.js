module.exports = (sequelize, type) => {
  const Pick = sequelize.define('Pick', {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true
    }
  }, {

  });

  Pick.associate = ({ Pick, Player }) => {
    Pick.belongsTo(Player);
  }

  return Pick;
};
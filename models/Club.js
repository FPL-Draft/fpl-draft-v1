module.exports = (sequelize, type) => {
  const Club = sequelize.define('Club', {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: type.STRING,
    club_id: type.INTEGER,
    strength_overall_home: type.INTEGER,
    strength_overall_away: type.INTEGER,
    strength_attack_home: type.INTEGER,
    strength_attack_away: type.INTEGER,
    strength_defence_home: type.INTEGER,
    strength_defence_away: type.INTEGER
  }, {

  });

  Club.associate = (models) => {
    Club.hasMany(models.Player, { foreignKey: 'club_id', targetKey: 'club_id' })
  }

  return Club;
};
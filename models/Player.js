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
    second_name: type.STRING,
    name: type.STRING,
    price: type.INTEGER,
    selectedBy: type.DOUBLE,
    club_id: type.INTEGER
  }, {

  });

  Player.associate = ({ Pick, PlayerStats, Club, MatchResult }) => {
    Player.belongsToMany(MatchResult, { through: Pick });
    Player.hasMany(PlayerStats);
    Player.belongsTo(Club, { foreignKey: 'club_id', targetKey: 'club_id' })
  }

  Player.addScope('withStats', (gw = null) => {
    return ({
      include: [
        {
          model: models.PlayerStats,
          where: {
            gameweek: gw
          }
        }
      ],
    })
  })

  return Player;
};

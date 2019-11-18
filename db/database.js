const Sequelize = require('sequelize');
const TeamModel = require('./models/Team');
const MatchModel = require('./models/Match');
const MatchResultModel = require('./models/MatchResult');
const PlayerModel = require('./models/Player');
const PickModel = require('./models/Pick');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './db/database.sqlite'
});

const Team = TeamModel(sequelize, Sequelize);
const Match = MatchModel(sequelize, Sequelize);
const MatchResult = MatchResultModel(sequelize, Sequelize);
const Player = PlayerModel(sequelize, Sequelize);
const Pick = PickModel(sequelize, Sequelize);

Match.hasMany(MatchResult);
MatchResult.belongsTo(Team);
MatchResult.belongsTo(Match);
Team.hasMany(MatchResult);
MatchResult.hasMany(Pick);

if (process.env.DUMP) {
  sequelize.sync({ force: true })
    .then(() => {
      console.log(`Database & tables created!`)
    });
}

module.exports = {
  sequelize,
  Team,
  Match,
  MatchResult,
  Player,
  Pick
};
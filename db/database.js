const Sequelize = require('sequelize');
const TeamModel = require('./models/Team');
const MatchModel = require('./models/Match');
const MatchResultModel = require('./models/MatchResult');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './db/database.sqlite'
});

const Team = TeamModel(sequelize, Sequelize);
const Match = MatchModel(sequelize, Sequelize);
const MatchResult = MatchResultModel(sequelize, Sequelize);

Match.hasMany(MatchResult);
MatchResult.belongsTo(Team);
Team.hasMany(MatchResult);
MatchResult.hasOne(MatchResult);

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
  MatchResult
};
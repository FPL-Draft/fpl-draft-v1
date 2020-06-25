module.exports = (sequelize, type) => {
  const Match = sequelize.define('Match', {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    gameweek: type.INTEGER,
    finished: type.BOOLEAN
  }, {
    
  });

  Match.associate = ({ Match, MatchResult }) => {
    Match.hasMany(MatchResult);
  }

  Match.extend = (models) => {
    /**
     * Instance Methods
     */
    Match.prototype.getGameweek = function () {
      return (this.gameweek > 29) ? `${this.gameweek - 9}+` : this.gameweek
    }
    /**
     * Class Scopes
     */
    Match.addScope('defaultScope', {
      include: [
        {
          model: models.MatchResult.unscoped()
        }
      ],
    }, { override: true })
    
    Match.addScope('justGameweeks', {
      where: {
        finished: true
      },
      group: 'gameweek'
    })
  }


  return Match;
};
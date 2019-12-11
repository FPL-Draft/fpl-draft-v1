'use strict';

var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var basename = path.basename(__filename);
var db = {};

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './models/database.sqlite',
  //logging: false
});

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
  if (db[modelName].extend) {
    db[modelName].extend(db);
  }
});

if (process.env.DUMP) {
  const ready = sequelize.sync({ force: true })
    .then(() => {
      console.log(`Database & tables created!`)
    });
  db.ready = ready;
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
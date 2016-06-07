'use strict';

var path = require('path');
var Sequelize = require('sequelize');
var config = require('config');

module.exports.connect = function(callback) {
  var dialect = config.sequelize;
  var sequelize = new Sequelize(dialect.database, dialect.username, dialect.password, dialect);

  // bind sequelize instance to Sequelize Class
  Sequelize.sequelize = sequelize;

  if (callback) {
    callback(null, sequelize);
  }

  return sequelize;
};

module.exports.loadModels = function(callback) {
  var models = {};
  var sequelize = Sequelize.sequelize;

  config.files.models.forEach(function(modelPath) {
    var model;
    var define = require(path.resolve(modelPath));

    if (typeof define === 'function') {
      model = sequelize.import(path.resolve(modelPath));
      models[model.name] = model;
    }
  });

  // bind models to Sequelize Class
  Sequelize.models = sequelize.models;

  Object.keys(models).forEach(function(modelName) {
    if (models[modelName].associate) {
      models[modelName].associate(models);
    }
  });

  if (callback) callback();

  return models;
};

'use strict';

var config = require('config');
var chalk = require('chalk');
var path = require('path');
var mongoose = require('mongoose');
var _ = require('lodash');

mongoose.Promise = require('bluebird');

module.exports.connect = function(callback) {
  var options = _.assign({}, config.mongoose.options, {
    useMongoClient: true
  });
  var db = mongoose.connect(config.mongoose.uri, options, function(err) {
    if (err) {
      console.error(chalk.red('Could not connect to MongoDB!'));
      console.error(err);
    } else {
      mongoose.set('debug', config.mongoose.debug);
    }

    if (callback) {
      callback(err, db);
    }
  });

  return db;
};

module.exports.disconnect = function(callback) {
  mongoose.disconnect(function(err) {
    console.info(chalk.yellow('Disconnected from MongoDB.'));
    if (callback) callback(err);
  });
};

module.exports.loadModels = function(callback) {
  var models = {};

  config.files.models.forEach(function(modelPath) {
    var model = require(path.resolve(modelPath));

    if (model && model.modelName) {
      models[model.modelName] = model;
    }
  });

  if (callback) callback();

  return models;
};

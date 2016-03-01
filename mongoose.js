'use strict';

var config = require('./config');
var chalk = require('chalk');
var path = require('path');
var mongoose = require('mongoose');

module.exports.connect = function(callback) {
  var db = mongoose.connect(config.mongo.uri, config.mongo.options, function(err) {
    if (err) {
      console.error(chalk.red('Could not connect to MongoDB!'));
      console.error(err);
    } else {
      mongoose.set('debug', config.mongo.debug);
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
  config.files.models.forEach(function(modelPath) {
    require(path.resolve(modelPath));
  });

  if (callback) callback();
};

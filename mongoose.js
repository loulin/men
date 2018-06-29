const config = require('config');
const chalk = require('chalk');
const path = require('path');
const mongoose = require('mongoose');
const { log } = require('./util');

mongoose.Promise = require('bluebird');

module.exports = {
  connect(callback) {
    const db = mongoose.connect(config.mongoose.uri, config.mongoose.options, (err) => {
      if (err) {
        log.error(chalk.red('Could not connect to MongoDB!'));
        log.error(err);
      } else {
        mongoose.set('debug', config.mongoose.debug);
      }

      if (callback) callback(err, db);
    });

    return db;
  },

  disconnect(callback) {
    return mongoose.disconnect((err) => {
      log.info(chalk.yellow('Disconnected from MongoDB.'));
      if (callback) callback(err);
    });
  },

  loadModels(callback) {
    const models = {};

    config.files.models.forEach((modelPath) => {
      const model = require(path.resolve(modelPath));

      if (model && model.modelName) {
        models[model.modelName] = model;
      }
    });

    if (callback) callback(null, models);

    return models;
  },
};

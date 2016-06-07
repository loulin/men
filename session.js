'use strict';

var chalk = require('chalk');
var session = require('express-session');
var config = require('config').express.session;
var Store;

if (process.env.NODE_ENV === 'production' && config.options.secret === 'MEN') {
  console.log(chalk.yellow('WARNING: session secret should be changed in production!'));
}

module.exports = function() {
  var men = require('./');
  var storeOptions;

  config.store = config.store || {};
  storeOptions = config.store.options || {};

  switch (config.store.adapter) {
    case 'mongo':
      if (!storeOptions.mongooseConnection && !storeOptions.url && !storeOptions.db) {
        storeOptions.mongooseConnection = men.mongoose;
      }

      Store = require('connect-mongo')(session);
      break;
    case 'mongodb':
      Store = require('connect-mongodb-session')(session);
      break;
    case 'redis':
      Store = require('connect-redis')(session);
      break;
    case 'sequelize':
      if (!storeOptions.db) {
        storeOptions.db = men.sequelize;
      }

      Store = require('connect-session-sequelize')(session.Store);
      break;
    default:
      Store = undefined;
  }

  if (Store) {
    config.options.store = new Store(storeOptions);
  }

  return session(config.options);
};

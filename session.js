const chalk = require('chalk');
const session = require('express-session');
const config = require('./config');
const { log } = require('./util');

module.exports = () => {
  const men = require('./');
  const sessionConfig = config.express.session || {};
  let Store;

  if (process.env.NODE_ENV === 'production' && sessionConfig.options.secret === 'MEN') {
    log.info(chalk.yellow('WARNING: session secret should be changed in production!'));
  }

  const storeOptions = sessionConfig.store.options || {};

  switch (sessionConfig.store.adapter) {
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
      if (!storeOptions.db) storeOptions.db = men.sequelize;

      Store = require('connect-session-sequelize')(session.Store);
      break;
    default:
      Store = undefined;
  }

  if (Store) sessionConfig.options.store = new Store(storeOptions);

  return session(sessionConfig.options);
};

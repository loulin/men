'use strict';

var chalk = require('chalk');
var session = require('express-session');
var config = require('./config').express.session;

if (process.env.NODE_ENV === 'production' && config.options.secret === 'MEN') {
  console.log(chalk.yellow('WARNING: session secret should be changed in production!'));
}

module.exports = session(config.options);

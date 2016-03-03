'use strict';

var _ = require('lodash');
var chalk = require('chalk');
var glob = require('glob');
var fs = require('fs');
var path = require('path');

var getGlobbedPaths = function(globPatterns) {
  var output = [];

  if (_.isArray(globPatterns)) {
    globPatterns.forEach(function(globPattern) {
      output = _.union(output, getGlobbedPaths(globPattern));
    });
  } else if (_.isString(globPatterns)) {
    output = _.union(output, glob.sync(globPatterns));
  }

  return output;
};

var validateSessionSecret = function(config) {
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  if (config.sessionSecret === 'MEN') {
    console.log(chalk.red('+ WARNING: sessionSecret should be changed in production!'));
    console.log(chalk.red('  Please add process.env.SESSION_SECRET or your secret to '));
    console.log(chalk.red('  `config/production.js` or `config/local.js`'));
    console.log();
    return false;
  }

  return true;
};

var initGlobalConfigFiles = function(config) {
  config.files = {};
  config.files.models = getGlobbedPaths('modules/*/model.js');
  config.files.routes = getGlobbedPaths('modules/*/route.js');
  config.files.policies = getGlobbedPaths('modules/*/policie.js');
  config.files.services = getGlobbedPaths('modules/*/service.js');
  config.files.controllers = getGlobbedPaths('modules/*/controller.js');
};

var initGlobalConfig = function() {
  var env = process.env.NODE_ENV;
  var config = {};
  var defaultConfig = path.join(process.cwd(), 'config/default');
  var localConfig = path.join(process.cwd(), 'config/local');

  if (fs.existsSync(defaultConfig)) {
    config = _.merge(config, require(defaultConfig));
  }

  _.merge(config, require(path.join(process.cwd(), 'config/', env)));

  if (fs.existsSync(localConfig)) {
    config = _.merge(config, require(localConfig));
  }

  config.package = require(path.join(process.cwd(), 'package.json'));
  config.app = config.app || {};

  _.defaults(config.app, {
    title: config.package.name,
    port: 3000,
    host: '127.0.0.1',
    environment: process.env.NODE_ENV
  });

  initGlobalConfigFiles(config);

  validateSessionSecret(config);

  return config;
};

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = initGlobalConfig();

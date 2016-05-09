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

var initGlobalConfigFiles = function(config) {
  config.files = {};
  config.files.models = getGlobbedPaths([
    'modules/*/model.js', 'modules/*/models/*.js'
  ]);
  config.files.routes = getGlobbedPaths('modules/*/route.js');
  config.files.policies = getGlobbedPaths('modules/*/policie.js');
  config.files.services = getGlobbedPaths('modules/*/service.js');
  config.files.controllers = getGlobbedPaths('modules/*/controller.js');
};

var initGlobalConfig = function() {
  var env = process.env.NODE_ENV;
  var config = _.cloneDeep(require('./config.default'));
  var defaultConfig = path.join(process.cwd(), 'config/default.js');
  var envConfig = path.join(process.cwd(), 'config/', env + '.js');
  var localConfig = path.join(process.cwd(), 'config/local.js');

  if (fs.existsSync(defaultConfig)) {
    _.merge(config, require(defaultConfig));
  }

  if (fs.existsSync(envConfig)) {
    _.merge(config, require(envConfig));
  } else {
    console.log(chalk.yellow('WARNING: ' + env + ' config is missing!'));
  }

  if (fs.existsSync(localConfig)) {
    _.merge(config, require(localConfig));
  }

  config.package = require(path.join(process.cwd(), 'package.json'));
  config.app.env = env;
  config.app.name = config.package.name;

  initGlobalConfigFiles(config);

  return config;
};

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = initGlobalConfig();

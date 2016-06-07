'use strict';

var _ = require('lodash');
var glob = require('glob');
var path = require('path');
var config = require('config');

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

var initGlobalConfigFiles = function() {
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
  var defaults = _.cloneDeep(require('./config.default'));

  _.defaultsDeep(config, defaults);
  config.package = require(path.join(process.cwd(), 'package.json'));
  config.app.env = env;
  config.app.name = config.package.name;

  initGlobalConfigFiles(config);

  return config;
};

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = initGlobalConfig();

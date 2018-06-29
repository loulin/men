const _ = require('lodash');
const glob = require('glob');
const path = require('path');
const config = require('config');

function getGlobbedPaths(globPatterns) {
  let output = [];

  if (_.isArray(globPatterns)) {
    globPatterns.forEach((globPattern) => {
      output = _.union(output, getGlobbedPaths(globPattern));
    });
  } else if (_.isString(globPatterns)) {
    output = _.union(output, glob.sync(globPatterns));
  }

  return output;
}

function initGlobalConfigFiles() {
  config.files = {};
  config.files.models = getGlobbedPaths([
    'modules/*/model.js', 'modules/*/models/*.js',
  ]);
  config.files.routes = getGlobbedPaths('modules/*/route.js');
}

function initGlobalConfig() {
  const env = process.env.NODE_ENV;
  const defaults = _.cloneDeep(require('./config.default'));

  _.defaultsDeep(config, defaults);
  config.package = require(path.join(process.cwd(), 'package.json'));
  config.app.env = env;
  config.app.name = config.package.name;

  initGlobalConfigFiles(config);

  return config;
}

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

module.exports = initGlobalConfig();

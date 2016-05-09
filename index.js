var path = require('path');
var _ = require('lodash');
var Promise = require('bluebird');
var chalk = require('chalk');
var config = require('./config');
var express = require('./express');
var men = {
  config: config,
  services: {},
  express: express
};

module.exports = men;

module.exports.initDatabase = function() {
  var db;
  var promise;

  if (config.sequelize) {
    db = require('./sequelize');
    men.sequelize = db.connect();
    men.models = db.loadModels();
    promise = men.sequelize.sync();
  }

  if (config.mongoose) {
    db = require('./mongoose');
    men.mongoose = db.connect();
    men.models = db.loadModels();
    promise = Promise.resolve();
  }

  return promise.then(function() {
    men.loadServices();
  });
};

module.exports.initServer = function(server) {
  var app = men.express.initExpress(server);

  men.initMiddleware(app);
  men.initRoutes(app);
  men.initErrorRoutes(app);

  app.listen(config.app.port, config.app.host, function() {
    console.log('--------------------------------------------');
    console.log(chalk.green(JSON.stringify(config.app, null, ' ')));
    console.log('--------------------------------------------');
  });
};

module.exports.start = function(server) {
  men.initDatabase();
  men.initServer(server);
};

module.exports.initPolicies = function() {
  config.files.policies.forEach(function(filePath) {
    require(path.resolve(filePath)).invokeRolesPolicies();
  });
};

module.exports.service = function(name, service) {
  men.services[name] = service;
};

module.exports.loadServices = function() {
  config.files.services.forEach(function(filePath) {
    require(path.resolve(filePath));
  });
};

module.exports.initMiddleware = function () {};

module.exports.initRoutes = function(app) {
  config.files.routes.forEach(function(routePath) {
    require(path.resolve(routePath))(app);
  });
};

module.exports.initErrorRoutes = function(app) {
  app.use(function(req, res, next) {
    next(404);
  });

  // development error handler will print stacktrace
  // production error handler no stacktraces leaked to user
  app.use(function(err, req, res, next) { // eslint-disable-line no-unused-vars
    var statusCode;
    var output = {};

    if (_.isInteger(err)) {
      statusCode = err;
    } else if (_.isString(err)) {
      statusCode = 400;
      output.message = err;
    } else {
      statusCode = err.status || 500;
      output.message = err.message;

      if (_.isError(err)) {
        console.error(err.stack);

        if (app.get('env') === 'production') {
          output.message = 'server error, please try later';
        } else {
          output.stack = err.stack;
        }
      }
    }

    res.status(statusCode);

    if (req.accepts(['html', 'json']) === 'json') {
      return res.json(output);
    }

    output.status = statusCode;

    if (!config.express.view) {
      return res.json(output);
    }

    return res.render('error', {
      error: output
    });
  });
};

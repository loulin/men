var path = require('path');
var _ = require('lodash');
var chalk = require('chalk');
var config = require('./config');
var express = require('./express');
var men = {
  config: config,
  services: {}
};

module.exports = men;

_.assign(men, express);

module.exports.start = function() {
  var app = this.initExpress();
  var db = config.postgres ? require('./sequelize') : require('./mongoose');

  db.connect();
  db.loadModels();

  this.loadServices();
  this.initRoutes(app);
  this.initErrorRoutes(app);

  app.listen(config.app.port, config.app.host, function() {
    console.log('--------------------------------------------');
    console.log(chalk.green(JSON.stringify(config.app, null, ' ')));
    console.log('--------------------------------------------');
  });
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

    if (Number.isInteger(err)) {
      statusCode = err;
    } else if (typeof err === 'string') {
      statusCode = 400;
      output.message = err;
    } else {
      statusCode = err.status || 500;
      output.message = err.message;

      if (err instanceof Error) {
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
    return res.render('error', {
      error: output
    });
  });
};

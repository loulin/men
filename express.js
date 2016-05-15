'use strict';

var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var compress = require('compression');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var helmet = require('helmet');
var flash = require('connect-flash');
var path = require('path');
var config = require('./config');
var logger = require('./logger');

module.exports.initLocalVariables = function(app) {
  app.locals = config.app;
  if (config.secure && config.secure.ssl === true) {
    app.locals.secure = config.secure.ssl;
  }

  app.use(function(req, res, next) {
    res.locals.host = req.protocol + '://' + req.hostname;
    res.locals.url = req.protocol + '://' + req.headers.host + req.originalUrl;
    next();
  });
};

module.exports.initMiddleware = function(app) {
  app.set('showStackError', true);

  app.enable('jsonp callback');

  // Should be placed before express.static
  app.use(compress({
    filter: function(req, res) {
      return (/json|text|javascript|css|font|svg/).test(res.getHeader('Content-Type'));
    },
    level: 9
  }));

  app.use(express.static(path.resolve('public')));

  if (app.locals.favicon) {
    app.use(favicon(app.locals.favicon));
  }

  app.use(morgan(logger.getFormat(), logger.getOptions()));

  if (process.env.NODE_ENV === 'development') {
    app.set('view cache', false);
  } else if (process.env.NODE_ENV === 'production') {
    app.locals.cache = 'memory';
  }

  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());
  app.use(methodOverride());
  app.use(express.static(path.resolve('public')));
  app.use(cookieParser());
  app.use(flash());

  if (config.express.cors) {
    app.options((require('cors')(config.express.cors)));
    app.use(require('cors')(config.express.cors));
  }
};

module.exports.initViewEngine = function(app) {
  if (config.express.view) {
    app.set('view engine', config.express.view.engine);
    app.set('views', config.express.view.path);
  }
};

module.exports.initSession = function(app) {
  if (config.express.session) {
    app.use(require('./session')(app));
  }
};

module.exports.initHelmetHeaders = function(app) {
  app.use(helmet.xframe());
  app.use(helmet.xssFilter());
  app.use(helmet.nosniff());
  app.use(helmet.ienoopen());
  app.use(helmet.hsts(config.express.helmet.hsts));
  app.disable('x-powered-by');
};

module.exports.initExpress = function(server) {
  var app = server || express();

  this.initLocalVariables(app);

  this.initMiddleware(app);

  this.initViewEngine(app);

  this.initHelmetHeaders(app);

  this.initSession(app);

  return app;
};

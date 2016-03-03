'use strict';

var config = require('./config');
var express = require('express');
var morgan = require('morgan');
var logger = require('./logger');
var bodyParser = require('body-parser');
var session = require('express-session');
var favicon = require('serve-favicon');
var compress = require('compression');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var helmet = require('helmet');
var flash = require('connect-flash');
var path = require('path');

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
};

module.exports.initViewEngine = function(app) {
  app.set('view engine', 'ejs');
  app.set('views', './views');
};

module.exports.initSession = function(app) {
  if (config.session) {
    app.use(session(config.session));
  }
};

module.exports.initHelmetHeaders = function(app) {
  var SIX_MONTHS = 15778476000;
  app.use(helmet.xframe());
  app.use(helmet.xssFilter());
  app.use(helmet.nosniff());
  app.use(helmet.ienoopen());
  app.use(helmet.hsts({
    maxAge: SIX_MONTHS,
    includeSubdomains: true,
    force: true
  }));
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

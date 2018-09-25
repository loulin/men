const _ = require('lodash');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const compress = require('compression');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const flash = require('connect-flash');
const path = require('path');
const config = require('./config');

require('express-async-errors');

const service = {
  initLocalVariables(app) {
    app.locals = config.app;

    if (config.secure && config.secure.ssl === true) {
      app.locals.secure = config.secure.ssl;
    }

    app.use((req, res, next) => {
      res.locals.host = `${req.protocol}://${req.hostname}`;
      res.locals.url = `${req.protocol}://${req.headers.host}${req.originalUrl}`;
      next();
    });
  },

  initMiddleware(app) {
    app.set('showStackError', true);

    app.enable('jsonp callback');

    // Should be placed before express.static
    app.use(compress({
      filter(req, res) {
        return (/json|text|javascript|css|font|svg/).test(res.getHeader('Content-Type'));
      },
      level: 9,
      ..._.get(config, 'compression.options'),
    }));

    app.use(express.static(path.resolve('public')));

    if (app.locals.favicon) {
      app.use(favicon(app.locals.favicon));
    }

    const morganFormat = _.get(config, 'log.format') || 'combined';
    const morganOptions = _.get(config, 'log.options');

    app.use(morgan(morganFormat, morganOptions));

    if (process.env.NODE_ENV === 'development') {
      app.set('view cache', false);
    } else if (process.env.NODE_ENV === 'production') {
      app.locals.cache = 'memory';
    }

    app.use(bodyParser.urlencoded({
      extended: true, ..._.get(config, 'bodyParser.urlencoded'),
    }));

    app.use(bodyParser.json(_.get(config, 'bodyParser.json')));
    app.use(methodOverride());

    const cookieSecret = _.get(config, 'cookie.secret');
    const cookieOptions = _.get(config, 'cookie.options');

    app.use(cookieParser(cookieSecret, cookieOptions));

    app.use(flash());

    if (config.express.cors) {
      app.options((require('cors')(config.express.cors)));
      app.use(require('cors')(config.express.cors));
    }
  },

  initViewEngine(app) {
    if (config.express.view) {
      app.set('view engine', config.express.view.engine);
      app.set('views', config.express.view.path);
    }
  },

  initSession(app) {
    if (config.express.session) {
      app.use(require('./session')(app));
    }
  },

  initHelmetHeaders(app) {
    const hidePoweredBy = _.get(config, 'helmet.hidePoweredBy') || { setTo: 'PHP 5' };
    const contentSecurityPolicy = _.get(config, 'helmet.contentSecurityPolicy');

    app.use(helmet.frameguard(_.get(config, 'helmet.frameguard')));
    app.use(helmet.xssFilter(_.get(config, 'helmet.xssFilter')));
    app.use(helmet.noSniff());
    app.use(helmet.ieNoOpen());
    app.use(helmet.hsts(config.helmet.hsts));
    app.use(helmet.hidePoweredBy(hidePoweredBy));

    if (contentSecurityPolicy) {
      app.use(helmet.contentSecurityPolicy(contentSecurityPolicy));
    }
  },

  initExpress(server) {
    const app = server || express();

    service.initLocalVariables(app);
    service.initMiddleware(app);
    service.initViewEngine(app);
    service.initHelmetHeaders(app);
    service.initSession(app);

    return app;
  },
};

module.exports = service;

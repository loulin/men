const path = require('path');
const _ = require('lodash');
const chalk = require('chalk');
const config = require('./config');
const express = require('./express');
const { log } = require('./util');

const men = {
  config,
  express,

  async initModels() {
    let db;

    if (config.sequelize) {
      db = require('./sequelize');
      men.sequelize = db.connect();
      men.models = db.loadModels();
      config.app.sequelize = `${config.sequelize.host}:${config.sequelize.database}`;
      await men.sequelize.sync();
    }

    if (config.mongoose) {
      db = require('./mongoose');
      men.mongoose = db.connect();
      men.models = db.loadModels();
      config.app.mongoose = config.mongoose.uri;
      await men.mongoose;
    }
  },

  initServer(server) {
    const app = express.initExpress(server);

    men.initMiddleware(app);
    men.initRoutes(app);
    men.initErrorRoutes(app);

    return app.listen(config.app.port, config.app.host, () => {
      log.info('--------------------------------------------');
      log.info(chalk.green(JSON.stringify(config.app, null, ' ')));
      log.info('--------------------------------------------');
    });
  },

  async start(server) {
    await men.initModels();

    return men.initServer(server);
  },

  initRoutes(app) {
    config.files.routes.forEach((routePath) => {
      require(path.resolve(routePath))(app);
    });
  },

  initErrorRoutes(app) {
    app.use((req, res, next) => next(404));

    // development error handler will print stacktrace
    // production error handler no stacktraces leaked to user
    app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
      let statusCode;
      let output = {};

      if (_.isInteger(err)) {
        statusCode = err;
      } else if (_.isString(err)) {
        statusCode = 400;
        output.message = err;
      } else {
        statusCode = err.status || 500;

        if (_.isError(err) && statusCode >= 500) {
          log.error(err.stack);

          if (app.get('env') === 'production') {
            output.message = 'server error, please try later';
          } else {
            output.message = err.message;
            output.stack = err.stack;
          }
        } else {
          output = err;
        }
      }

      res.status(statusCode);

      if (req.accepts(['html', 'json']) === 'json') return res.json(output);

      output.status = statusCode;

      if (!config.express.view) return res.json(output);

      return res.render('error', { error: output });
    });
  },
};

module.exports = men;

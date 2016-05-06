# MEN
A Module based Express framework by Node.js

Heavily inspired by (copied/extracted from) [MEAN.JS](http://expressjs.com/)

## Quick Start

```js
var men = require('men');
men.start();
```

## Project Structure

    .
    ├── config
    │   ├── default.js             # default/base config
    │   ├── development.js         # development config
    │   ├── production.js          # production config
    │   └── local.js               # local config
    ├── modules
    │   ├── user                   # user module example
    │   │   ├── route.js           # express route for user
    │   │   ├── controller.js      # user controller
    │   │   └── service.js         # user service
    │   └── ...
    ├── public
    │   └── ...                    # public static files
    ├── view
    │   └── ...                    # express ejs views
    └── app.js                     # server entry point

## Configuration

All config entries are optional. See [config.example.js](https://github.com/loulin/men/blob/master/config.example.js)

For postgres, sequelize instance and models are bound to Sequelize as Sequelize.sequelize and Sequelize.models.

All express functions can be overwritten by men.express:
```js
var men = require('men');

men.express.initSession = function(app) {
  var session = require('express-session');
  var MongoStore = require('connect-mongo/es5')(session);

  men.config.express.session.store = new MongoStore({
    url: men.config.express.session.store.url,
  });

  app.use(session(men.config.express.session.options));
};

men.start();
```

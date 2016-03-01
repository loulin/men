# MEN
A Module based Express framework by Node.js

Heavily inspired by (copied/extracted from) [MEAN.JS](http://expressjs.com/)

## Project Structure

    .
    ├── config
    │   ├── default.js             # default/base config
    │   ├── development.js         # development config
    │   ├── production.js          # production config
    │   └── local.js               # local config
    ├── modules
    │   ├── user                   # user module example
    │   │   ├── model.js           # user model definition
    │   │   ├── route.js           # express route for user
    │   │   ├── controller.js      # user controller
    │   │   └── service.js         # user service
    │   └── ...
    ├── public
    │   └── ...                    # public static files
    ├── view
    │   └── ...                    # express ejs views
    └── app.js                     # server entry point

> app.js
```js
var men = require('men');
men.start();
```
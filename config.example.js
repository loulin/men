

module.exports = {
  app: {
    port: 8888,
    host: '127.0.0.1',
  },
  sequelize: {
    username: 'men',
    password: 'men',
    database: 'men',
    host: '127.0.0.1',
    dialect: 'postgres',
    logging: console.log,
  },
  mongoose: {
    uri: process.env.MONGODB_URL || 'mongodb://localhost/men',
    options: {
      user: '',
      pass: '',
    },
    debug: process.env.MONGODB_DEBUG || false,
  },
  express: {
    session: {
      store: {
        adapter: 'mongo',
        options: {
          url: 'mongodb://localhost/men',
        },
      },
      options: {
        saveUninitialized: false,
        resave: true,
        secret: 'MEN',
      },
    },
  },
  wechat: {
    token: 'token',
    appid: 'appid',
    encodingAESKey: '0O0O0O0O0O0O0O0O0O0O0O0O0O0O0O0O0O0O0O0O0O0',
  },
};

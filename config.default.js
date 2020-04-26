module.exports = {
  app: {
    port: 3000,
    host: '127.0.0.1',
  },
  express: {
    view: {
      engine: 'ejs',
      path: './views',
    },
  },
  helmet: {
    hsts: {
      maxAge: 15778476000, // SIX_MONTHS
      includeSubDomains: true,
      force: true,
    },
  },
};

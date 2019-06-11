const path = require('path');
const Sequelize = require('sequelize');
const config = require('config');

module.exports = {
  connect(callback) {
    const dialect = config.sequelize;
    const sequelize = new Sequelize(dialect.database, dialect.username, dialect.password, dialect);

    // bind sequelize instance to Sequelize Class
    Sequelize.sequelize = sequelize;

    if (callback) callback(null, sequelize);

    return sequelize;
  },

  loadModels(callback) {
    const models = {};
    const { sequelize } = Sequelize;

    config.files.models.forEach((modelPath) => {
      let model;
      const define = require(path.resolve(modelPath));

      if (typeof define === 'function' && !define.modelName) {
        model = sequelize.import(path.resolve(modelPath));
        models[model.name] = model;
      }
    });

    // bind models to Sequelize Class
    Sequelize.models = sequelize.models;

    Object.keys(models).forEach((modelName) => {
      if (models[modelName].associate) models[modelName].associate(models);
    });

    if (callback) callback(null, models);

    return models;
  },
};

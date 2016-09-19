'use strict';

var _ = require('lodash');
var config = require('config');
var chalk = require('chalk');
var fileStreamRotator = require('file-stream-rotator');
var fs = require('fs');
var path = require('path');

function getLogFormat() {
  return config.log && config.log.format || 'combined';
}

function getLogOptions() {
  var fileName;
  var options = config.log && config.log.options ? _.clone(config.log.options, true) : {};

  if (_.has(options, 'stream')) {
    try {
      if (_.has(options, 'stream.rotatingLogs') && options.stream.rotatingLogs.active) {
        if (options.stream.rotatingLogs.fileName.length && options.stream.directoryPath.length) {
          if (!fs.existsSync(options.stream.directoryPath)) {
            fs.mkdirSync(options.stream.directoryPath);
          }

          fileName = path.join(options.stream.directoryPath, options.stream.rotatingLogs.fileName);
          options.stream = fileStreamRotator.getStream({
            filename: fileName,
            frequency: options.stream.rotatingLogs.frequency,
            verbose: options.stream.rotatingLogs.verbose
          });
        } else {
          throw new Error('Invalid log rotating fileName or directoryPath.');
        }
      } else {
        if (options.stream.fileName.length && options.stream.directoryPath.length) {
          if (!fs.existsSync(options.stream.directoryPath)) {
            fs.mkdirSync(options.stream.directoryPath);
          }

          fileName = path.join(options.stream.directoryPath, options.stream.fileName);
          options.stream = fs.createWriteStream(fileName, {
            flags: 'a'
          });
        } else {
          throw new Error('Invalid log stream fileName or directoryPath.');
        }
      }
    } catch (err) {
      delete options.stream;

      console.log();
      console.log(chalk.red('The stream option has been omitted. Error:'));
      console.log(chalk.red(err));
      console.log();
    }
  }

  return options;
}

module.exports = {
  getFormat: getLogFormat,
  getOptions: getLogOptions
};

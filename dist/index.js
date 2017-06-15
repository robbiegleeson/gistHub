#!/usr/bin/env node --harmony
'use strict';

require('babel-polyfill');

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _init = require('./options/init');

var _init2 = _interopRequireDefault(_init);

var _git = require('./options/git');

var git = _interopRequireWildcard(_git);

var _config = require('./config');

var config = _interopRequireWildcard(_config);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const currVersion = require('../package.json').version;

_commander2.default.version(currVersion).command('init').alias('i').description('Initialize the application').action(command => (0, _init2.default)(command));

_commander2.default.arguments('<file>').alias('a').description('Create a new Gist: gist <../path-to-file> [options]').option('-p, --isPublic', 'Set the visability of the Gist (default: false)').option('-r, --remove', 'Delete a Gist given The ID (-d <gist-id>)').option('-d, --description', 'Add a description to the Gist').action((file, options) => git.createGist(file, options));

_commander2.default.command('view').alias('v').description('View user Gists').action(command => git.viewGists(command));

_commander2.default.command('reset').alias('r').description('Reset user configuration').action(command => config.reset(command));

_commander2.default.on('*', command => {
  console.log(`The command '${command}' does not exist`);
  console.log(`Please refer to the help section ${'gist -h'} for options`);
});

_commander2.default.parse(process.argv);
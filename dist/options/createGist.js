'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createGist;

var _colors = require('colors');

var _colors2 = _interopRequireDefault(_colors);

var _githubApi = require('github-api');

var _githubApi2 = _interopRequireDefault(_githubApi);

var _copyPaste = require('copy-paste');

var _copyPaste2 = _interopRequireDefault(_copyPaste);

var _config = require('../config');

var config = _interopRequireWildcard(_config);

var _ora = require('ora');

var _ora2 = _interopRequireDefault(_ora);

var _thunkify = require('thunkify');

var _thunkify2 = _interopRequireDefault(_thunkify);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _opn = require('opn');

var _opn2 = _interopRequireDefault(_opn);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const read = (0, _thunkify2.default)(_fs2.default.readFile);
const spinner = (0, _ora2.default)('Creatng gist...');

const optionDefinitions = [{ name: 'username', alias: 'u', type: String }, { name: 'file', type: String }, { name: 'public', alias: 'p', type: Boolean }, { name: 'remove', alias: 'r', type: String }, { name: 'description', alias: 'd', type: String }];

const questions = [{
  type: 'confirm',
  name: 'view',
  message: 'Open Gist in browser?'
}];

function createGist(file, options) {
  spinner.start();
  const title = _path2.default.basename(file);
  const description = options.description || '';
  const isPublic = options.isPublic || false;
  const userConfig = config.getUserConfig();

  if (!userConfig) {
    console.log('No configuration settings found. Run gist init to setup');
    process.exit();
  }

  read(file, 'utf8')(function (err, content) {
    if (err) {
      console.log('Unable to read file...'.red);
      process.exit(0);
    }

    const client = new _githubApi2.default({
      username: userConfig.username,
      password: userConfig.password
    });

    const gist = client.getGist();

    gist.create({
      public: isPublic,
      description: description,
      files: {
        [title]: {
          content: content
        }
      }
    }).then(response => {
      if (response.status === 201) {
        _copyPaste2.default.copy(response.data.html_url, () => {
          spinner.stop();
          console.log('Yay, Gist created!'.green);

          _inquirer2.default.prompt(questions).then(ans => {
            if (ans.view) {
              (0, _opn2.default)(response.data.html_url);
              process.exit();
            } else {
              console.log(`Copied Gist URL to clipboard!`.green);
              process.exit();
            }
          });
        });
      } else if (!response) {
        console.log('No response'.red);
        process.exit(0);
      }
    });
  });
}
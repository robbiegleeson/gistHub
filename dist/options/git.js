'use strict';

var _safe = require('colors/safe');

var _safe2 = _interopRequireDefault(_safe);

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

var _opn = require('opn');

var _opn2 = _interopRequireDefault(_opn);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const read = (0, _thunkify2.default)(_fs2.default.readFile);
const usersUrl = 'https://api.github.com/users/';
const gistUrl = 'https://api.github.com/gists';
const questions = [{
  type: 'confirm',
  name: 'view',
  message: 'Open Gist in browser?'
}];

function createGist(file, options) {
  const spinner = (0, _ora2.default)('Creatng gist...');
  spinner.start();
  const title = _path2.default.basename(file);
  const description = options.description || '';
  const isPublic = options.isPublic || false;
  const userConfig = config.getUserConfig();

  if (!userConfig) {
    console.log(_safe2.default.red('No configuration settings found. Run gist init to setup'));
    process.exit();
  }

  read(file, 'utf8')(function (err, content) {
    if (err) {
      console.log(_safe2.default.red('Unable to read file...'));
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
          console.log(_safe2.default.green('Yay, Gist created!'));

          _inquirer2.default.prompt(questions).then(ans => {
            if (ans.view) {
              (0, _opn2.default)(response.data.html_url);
              process.exit();
            } else {
              console.log(_safe2.default.green(`Copied Gist URL to clipboard!`));
              process.exit();
            }
          });
        });
      } else if (!response) {
        console.log(_safe2.default.red('No response'));
        process.exit();
      }
    });
  });
}

function viewGists() {
  const spinner = (0, _ora2.default)('Loading gists...');
  spinner.start();
  const userConfig = config.getUserConfig();
  const gistIdArray = [];
  const gistMap = {};

  if (!userConfig) {
    console.log(_safe2.default.red('No configuration settings found. Run gist init to setup'));
    process.exit();
  }

  const gitRequest = _request2.default.defaults({
    headers: {
      'User-Agent': 'ua'
    },
    auth: {
      'username': userConfig.username,
      'password': userConfig.password
    }
  });

  gitRequest(`${usersUrl}${userConfig.username}/gists`, (error, resp, body) => {
    if (error) {
      console.log(_safe2.default.red(`Error: ${error}`));
      process.exit(0);
    }

    if (resp.statusCode === 403 || resp.statusCode === 401) {
      console.log(_safe2.default.red(`Error: ${resp.statusMessage}`));
      process.exit(0);
    }

    const obj = JSON.parse(resp.body);
    const gists = Object.keys(obj).map(function (key) {
      return obj[key];
    });

    for (var i = 0; i < gists.length; i++) {
      var gist = gists[i];
      gistIdArray.push(Object.values(gist.files)[0].filename);
      gistMap[Object.values(gist.files)[0].filename] = gist;
    }
    spinner.stop();
    _inquirer2.default.prompt([{
      type: 'list',
      name: 'choice',
      message: 'Select Gist...',
      choices: gistIdArray
    }]).then(ans => {
      const chosenGist = gistMap[ans.choice];
      console.log(_safe2.default.yellow('Filename:') + ` ${Object.values(chosenGist.files)[0].filename}`);
      console.log(_safe2.default.yellow('Created On:') + ` ${new Date(chosenGist.created_at)}`);
      console.log(_safe2.default.yellow('Updated On:') + ` ${new Date(chosenGist.updated_at)}`);

      _inquirer2.default.prompt([{
        type: 'list',
        name: 'choice',
        message: 'Delete Gist?',
        choices: ['Yes', 'No']
      }]).then(ans => {
        if (ans.choice === 'Yes') {
          deleteGist(chosenGist.id, userConfig.username, userConfig.password);
        }
      });
    });
  });
}

function deleteGist(gistId, username, password) {
  try {
    const spinner = (0, _ora2.default)('Deleting gist...');
    let gitRequest = _request2.default.defaults({
      headers: {
        'User-Agent': 'ua'
      },
      auth: {
        'username': username,
        'password': password
      }
    });

    spinner.start();

    console.log(`${gistUrl}/${gistId}`);
    gitRequest.delete(`${gistUrl}/${gistId}`, (error, response, body) => {
      if (error) {
        console.log(_safe2.default.red('Error:') + ` ${error}`);
      }

      if (response.statusCode === 403 || response.statusCode === 401 || response.statusCode === 404) {
        console.log(_safe2.default.red(`Error: ${response.statusMessage}`));
      }

      if (response.statusCode === 204) {
        spinner.stop();
        console.log(_safe2.default.green('Deleted'));
        process.exit();
      }
    });
  } catch (err) {
    console.log(_safe2.default.red('Error: ') + err);
    process.exit();
  }
}

module.exports = {
  createGist,
  viewGists
};
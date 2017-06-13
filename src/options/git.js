import colors from 'colors/safe';
import GitHub from 'github-api';
import clipboard from 'copy-paste';
import * as config from '../config';
import ora from 'ora';
import thunkify from 'thunkify';
import fs from 'fs';
import path from 'path';
import opn from 'opn';
import request from 'request';
import inquirer from 'inquirer';

const read = thunkify(fs.readFile);
const usersUrl = 'https://api.github.com/users/';
const gistUrl = 'https://api.github.com/gists'
const questions = [
  {
    type: 'confirm',
    name: 'view',
    message: 'Open Gist in browser?',
  },
];

function createGist(file, options) {
  const spinner = ora('Creatng gist...');
  spinner.start();
  const title = path.basename(file);
  const description = options.description || '';
  const isPublic = options.isPublic || false;
  const userConfig = config.getUserConfig();

  if (!userConfig) {
    console.log(colors.red('No configuration settings found. Run gist init to setup'));
    process.exit();
  }

  read(file, 'utf8')(function (err, content) {
    if (err) {
      console.log(colors.red('Unable to read file...'));
      process.exit(0);
    }

    const client = new GitHub({
      username: userConfig.username,
      password: userConfig.password,
    });

    const gist = client.getGist();

    gist.create({
      public: isPublic,
      description: description,
      files: {
        [title]: {
          content: content,
        }
      }
    }).then((response) => {
      if (response.status === 201) {
        clipboard.copy(response.data.html_url, () => {
          spinner.stop();
          console.log(colors.green('Yay, Gist created!'));

          inquirer.prompt(questions)
          .then((ans) => {
            if (ans.view) {
              opn(response.data.html_url);
              process.exit();
            } else {
              console.log(colors.green(`Copied Gist URL to clipboard!`));
              process.exit();
            }
          });
        });
      } else if (!response) {
        console.log(colors.red('No response'));
        process.exit();
      }
    });
  });
}

function viewGists() {
  const spinner = ora('Loading gists...');
  spinner.start();
  const userConfig = config.getUserConfig();
  const gistIdArray = [];
  const gistMap = {};

  if (!userConfig) {
    console.log(colors.red('No configuration settings found. Run gist init to setup'));
    process.exit();
  }

  const gitRequest = request.defaults({
    headers: {
      'User-Agent': 'ua'
    },
    auth: {
      'username': userConfig.username,
      'password': userConfig.password,
    },
  });

  gitRequest(`${usersUrl}${userConfig.username}/gists`, (error, resp, body) => {
    if (error) {
      console.log(colors.red(`Error: ${error}`));
      process.exit(0);
    }

    if (resp.statusCode === 403 || resp.statusCode === 401) {
      console.log(colors.red(`Error: ${resp.statusMessage}`));
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
    inquirer.prompt([{
      type: 'list',
      name: 'choice',
      message: 'Select Gist...',
      choices: gistIdArray,
    },
  ]).then((ans) => {
    const chosenGist = gistMap[ans.choice];
    console.log(colors.yellow('Filename:') + ` ${Object.values(chosenGist.files)[0].filename}`);
    console.log(colors.yellow('Created On:') + ` ${new Date(chosenGist.created_at)}`);
    console.log(colors.yellow('Updated On:') + ` ${new Date(chosenGist.updated_at)}`);

    inquirer.prompt([{
      type: 'list',
      name: 'choice',
      message: 'Delete Gist?',
      choices: ['Yes', 'No'],
    }]).then((ans) => {
      if (ans.choice === 'Yes') {
        deleteGist(chosenGist.id, userConfig.username, userConfig.password)
      }
    })
  });
});
}

function deleteGist(gistId, username, password) {
  try {
    const spinner = ora('Deleting gist...');
    let gitRequest = request.defaults({
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
        console.log(colors.red('Error:') + ` ${error}`);
      }

      if (response.statusCode === 403 || response.statusCode === 401 ||
          response.statusCode === 404) {
            console.log(colors.red(`Error: ${response.statusMessage}`));
      }

      if (response.statusCode === 204) {
        spinner.stop();
        console.log(colors.green('Deleted'));
        process.exit();
      }
      });
    } catch(err) {
      console.log(colors.red('Error: ') + err);
      process.exit();
    }
  }

  module.exports = {
    createGist,
    viewGists,
  };

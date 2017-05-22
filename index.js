#!/usr/bin/env node --harmony
const commander = require('commander');
const co = require('co');
const prompt = require('co-prompt');
const GitHub = require('github-api');
const thunkify = require('thunkify');
const fs = require('fs');
const clipboard = require('copy-paste');
const path = require('path');
const nopt = require('nopt');
const opn = require('opn');
const request = require('request');
const commandLineArgs = require('command-line-args');
const colors = require('colors');
const inquirer = require('inquirer');
const gist_config = ".user-config";
const _ = require('underscore');
const ora = require('ora');
const spinner = ora('Working...');
const Table = require('cli-table');


const read = thunkify(fs.readFile);
const DEFAULT_DESCRIPTION = 'Created with gistHub | by Rob Gleeson';
const HOMEDIR = process.env[(process.platform == 'WIN32') ? 'USERPROFILE' : 'HOME'];

const usersUrl = 'https://api.github.com/users/';
const gistUrl = 'https://api.github.com/gists/'

const optionDefinitions = [
    {name: 'username', alias: 'u', type: String},
    {name: 'file', type: String},
    {name: 'public', alias: 'p', type: Boolean},
    {name: 'remove', alias: 'r', type: String},
    {name: 'description', alias: 'd', type: String}
]

function *requestUserPassword() {
    return yield prompt.password('Git Password: '.yellow);
}

function *validateArgs(options) {
    let isPublic, description = DEFAULT_DESCRIPTION;

    const userconfig = JSON.parse(configExists());

    if (!userconfig.username || userconfig.username === '') {
        console.log('You didn\'t give me your username! -u <username>'.red);
        process.exit(0);
    }

    if (!options.public || options.public === '') {
        isPublic = false;
    }

    const username = userconfig.username;
    const gistId = options.remove;
    const view = options.view;
    isPublic = options.public;

    if (options.description) {
        description = options.description;
    }

    return {username, gistId, isPublic, view, description}
}

function *showUserGists(username) {
    const userconfig = JSON.parse(configExists());
    let password;
    if (!userconfig.password) {
        password = yield requestUserPassword();
    }

    gitRequest = thunkify(gitRequest);

    var resp = (yield gitRequest(usersUrl + username + '/gists'))[0];
    if (resp.statusCode === 403 || resp.statusCode === 401) {
        console.log(`Error: ${resp.statusMessage}`.red);
        process.exit(0);
    }

    var obj = JSON.parse(resp.body);
    var gists = Object.keys(obj).map(function (key) {
        return obj[key];
    });

    let table = new Table({
        head: ['', 'Gist Name']
      , colWidths: [10, 30]
    });

    let newObj = {};
    for (let i = 0; i < gists.length; i++) {
        let gist = gists[i];
        table.push([i + 1, Object.keys(gist.files)])
    }

    console.log(table.toString());
    if (!gists.length) {
        process.exit(0);
    }

    let answer = yield prompt('Do you wish to delete any of the above gists: y/n '.yellow);
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        let nextAnswer = yield prompt('Please enter the number you wish to delete '.yellow);
        if (!isNaN(parseInt(nextAnswer)) && parseInt(nextAnswer) <= gists.length && parseInt(nextAnswer) >=  1) {
            yield deleteGist(gists[parseInt(nextAnswer) - 1].id, username, password);
        } else {
            console.log('The number you entered was not in the table above, please try again'.red);
        }
    }
    process.exit(0);
}

function createGist(args, title, fileContent) {
    co(function *() {
        const userconfig = JSON.parse(configExists());
        let password;
        if (!userconfig.password) {
            password = yield requestUserPassword();
        }

        password = userconfig.password;

        let client = new GitHub({
           username: args.username,
           password: password
        });

        let gist = client.getGist();

        let resp = yield gist.create({
            public: args.isPublic,
            description: args.description,
            files: {
                [title]: {
                    content: fileContent,
                }
            }
        });

        if (resp.status === 201) {
            clipboard.copy(resp.data.html_url, () => {
                co(function *() {
                    spinner.stop();
                    console.log('Yay, Gist created!'.green);
                    const choice = yield prompt('Do you wish to open your Gist in a broswer?: y/n '.yellow);
                    if (choice.toLowerCase() === 'y' || choice.toLowerCase() === 'yes') {
                        opn(resp.data.html_url);
                    } else {
                        console.log(`Copied Gist URL to clipboard!`.green);
                     }
                     process.exit(0);
                });
            });
        } else if (!resp) {
            console.log('No response'.red);
            process.exit(0);
        }
    });
}

function *deleteGist(gistId, username, password) {
    try {
        let gitRequest = request.defaults({
            headers: {
                'User-Agent': 'ua'
            },
            auth: {
                'username': username,
                'password': password
            }
        });

        const confirm = yield prompt('Are you sure you want to delete that Gist?: y/n '.yellow);
        spinner.start();
        gitRequest.delete = thunkify(gitRequest.delete);
        if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
            let resp = (yield gitRequest.delete(gistUrl + gistId))[0];

            if (resp.statusCode === 403 ||
                resp.statusCode === 401 ||
                resp.statusCode === 404) {
                console.log(`Error: ${resp.statusMessage}`.red);
            } else {
                spinner.stop();
                console.log('Gist was deleted!'.green);
            }
        }
    } catch(err) {
        console.log('Error: ' + err);
    }
    process.exit(0);
}

function saveConfig(params) {
    const userconfig = {
        username: params.username,
        password: params.password,
    };

    if(!fs.existsSync(HOMEDIR + "/" + gist_config)) {
    	fs.mkdir(HOMEDIR + "/" + gist_config);
        fs.writeFileSync(HOMEDIR + "/" + gist_config + "/user-config.json", JSON.stringify(userconfig));
    } else {
        fs.writeFileSync(HOMEDIR + "/" + gist_config + "/user-config.json", JSON.stringify(userconfig));
    }
}

function configExists() {
    if (!fs.existsSync(HOMEDIR + '/' + gist_config)) {
        return false;
    }

    if (!fs.existsSync(HOMEDIR + '/' + gist_config + '/user-config.json')) {
        return false;
    }
    return fs.readFileSync(HOMEDIR + '/' + gist_config + '/user-config.json');
}

commander
    .command('reset')
    .description('Remove existig configuration settings')
    .action(function () {
        fs.stat(HOMEDIR + '/' + gist_config + '/user-config.json', function (err, stats) {
           if (err) {
               return console.error('Config file does not exist'.err);
               process.exit();
           }

           fs.unlink(HOMEDIR + '/' + gist_config + '/user-config.json', function(err){
                if(err) return console.log(err);
                console.log('file deleted successfully'.green);
                process.exit();
           });
        });
    });

commander
    .command('init')
    .description('Configure your GitHub credentials')
    .action(function() {
        co(function *() {
            if (configExists()) {
                console.log('GistHub already configured'.red);
                process.exit();
            }

            let username = yield prompt('Enter you GitHub username or email: '.yellow);
            const password = yield prompt.password('Enter your GitHub password: '.yellow);

            saveConfig({username, password});
            console.log('Success: Configuration complete'.green);
            process.exit();
        });
    });

commander
    .command('test')
    .action(function () {
        inquirer.prompt([{
            type: 'checkbox',
            name: 'choice',
            message: 'What do you want to do?',
            choices: [
              'Order a pizza',
              'Make a reservation',
            //   new inquirer.Separator(),
            //   'Ask for opening hours',
            //   {
            //     name: 'Contact support',
            //     disabled: 'Unavailable at this time'
            //   },
            //   'Talk to the receptionist'
            ]},
        ]).then(function (answers) {
            console.log(JSON.stringify(answers, null, '  '));
        });
    });

commander
    .command('view')
    .description('View user gists')
    .action(function () {
        co(function*() {
            if (!configExists()) {
                console.log('App not set up. Please run gist init'.red);
                process.exit();
            }
            spinner.start();
            const options = commandLineArgs(optionDefinitions)
            const args = yield validateArgs(options);

            const username = args.username;

            yield showUserGists(username);
        });
    });


commander
    .arguments('<file>')
    .option('-p, --isPublic', 'Set the visability of the Gist (default: false)')
    .option('-r, --remove', 'Delete a Gist given The ID (-d <gist-id>)')
    .option('-d, --description', 'Add a description to the Gist')
    .action(function(file) {
        co(function *() {
            if (!configExists()) {
                console.log('Please run gist init'.red);
                process.exit();
            }

            const options = commandLineArgs(optionDefinitions)
            const args = yield validateArgs(options);

            const username = args.username;
            const gistId = args.gistId;

            if (!args.username) {
                console.log('No username given.'.red);
                process.exit(0);
            }

            if (args.gistId) {
                yield deleteGist(gistId, username);
                return;
            } else {
                let title = path.basename(file);
                spinner.start();
                read(file, 'utf8')(function (err, fileContent) {
                    if (err) {
                        console.log('Unable to read file...'.red);
                        process.exit(0);
                    }

                    createGist(args, title, fileContent);
                });
            }
        }).catch((err) => {
            console.log(`Error: ${err}`.red);
            process.exit(0);
        });
}).parse(process.argv);

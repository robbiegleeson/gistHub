#!/usr/bin/env node --harmony
const program = require('commander');
const co = require('co');
const prompt = require('co-prompt');
const GitHub = require('github-api');
const thunkify = require('thunkify');
const fs = require('fs');
const clipboard = require('copy-paste');
const chalk = require('chalk');
const path = require('path');
const nopt = require('nopt');
const opn = require('opn');
const request = require('request');

const commandLineArgs = require('command-line-args')

const read = thunkify(fs.readFile);
const DEFAULT_DESCRIPTION = 'Created with gistHub | by Rob Gleeson';

const optionDefinitions = [
    {name: 'username', alias: 'u', type: String},
    {name: 'file', type: String},
    {name: 'view', alias: 'v', type: Boolean},
    {name: 'publiv', alias: 'p', type: Boolean}
]

function *validateArgs(processArgs) {
    var opts = {
        public: Boolean,
        username: String,
    };

    var shorthands = {
        p: '--public',
        e: '--username',
    };

    var args = nopt(opts, shorthands, processArgs)
    var isPublic;

    if (!args.username || args.username === '') {
        console.log(chalk.red('You didn\'t give me your username! -e <username>'));
        process.exit(0);
    }

    if (!args.public || args.public === '') {
        isPublic = false;
    }

    var password = yield prompt.password('Git password: ');
    var username = args.username;
    isPublic = args.public;

    return {password, username, isPublic}
}

function *showUserGists(username) {
    var password = yield prompt.password('Git password: ');
    var gitRequest = request.defaults({
        headers: {
            'User-Agent': 'ua'
        },
        auth: {
            'username': username,
            'password': password
        }
    });

    gitRequest('https://api.github.com/users/' + username + '/gists', function(err, resp, body) {
        if (err) {
            console.log(`Error: ${err}`);
            process.exit(0);
        }

        if (resp.statusCode === 403) {
            console.log(chalk.red(`Error: ${resp.statusMessage}`));
            process.exit(0);
        }

        var obj = JSON.parse(resp.body);
        var arr = Object.keys(obj).map(function (key) {
            return obj[key];
        });

        var newObj = {};
        console.log('File\t\t\t\tCreated Time\t\t\tID');
        for (var i = 0; i < arr.length; i++) {
            var gist = arr[i];
            console.log(Object.keys(gist.files)+'\t\t\t'+gist.created_at+'\t\t'+gist.id);
        }
    });
}

function createGist(args, title, fileContent) {
    var gh = new GitHub({
       username: args.username,
       password: args.password
    });

    var gist = gh.getGist();

    gist.create({
        public: args.isPublic,
        description: DEFAULT_DESCRIPTION,
        files: {
            [title]: {
                content: fileContent,
            }
        }
    }).then(function (resp) {
        if (resp.status === 201) {
            clipboard.copy(resp.data.html_url, () => { // eslint-disable-line
                co(function *() {
                    console.log(chalk.green('Yay, Gist created!'));
                    const choice = yield prompt(chalk.blue('Do you wish to open your Gist in a broswer?: y/n '));
                    if (choice === 'y') {
                        opn(resp.data.html_url);
                    } else {
                        console.log(chalk.green(`Copied Gist URL to clipboard!`));
                    }
                    process.exit(0)
                });
            });
        } else if (!resp) {
            console.log('No response');
            process.exit(0)
        }
    }).catch(function (err) {
        console.log(chalk.red('Error: Unale to authenticate you.'));
    });
}
program
    .arguments('<file>')
    .option('-u, --username', 'The username of the GitHub account (Required)')
    .option('-v, --view', 'View authenticating users Gists')
    .option('-p, --isPublic', 'Set the visability of the Gist (default: false)')
    .action(function(file) {
        co(function *() {

            const options = commandLineArgs(optionDefinitions)

            if (options.view) {
                if (!options.username) {
                    console.log(chalk('No username given.'));
                    process.exit(0);
                }

                const username = options.username;
                yield showUserGists(username);
            } else {
                const args = yield validateArgs(process.argv);

                var title = path.basename(file);

                read(file, 'utf8')(function (err, fileContent) {
                    if (err) {
                        console.log(chalk.red('Unable to read file...'));
                        process.exit(0);
                    }

                    createGist(args, title, fileContent);
                });
            }
        }).catch((err) => {
            console.log(chalk.red(`Error: ${err}`));
            process.exit(0);
        });
}).parse(process.argv);

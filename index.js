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

const read = thunkify(fs.readFile);
const DEFAULT_DESCRIPTION = 'Created with gistHub | by Rob Gleeson';

const usersUrl = 'https://api.github.com/users/';
const gistUrl = 'https://api.github.com/gists/'

const optionDefinitions = [
    {name: 'username', alias: 'u', type: String},
    {name: 'file', type: String},
    {name: 'view', alias: 'v', type: Boolean},
    {name: 'public', alias: 'p', type: Boolean},
    {name: 'remove', alias: 'r', type: String},
    {name: 'description', alias: 'd', type: String}
]

function *requestUserPassword() {
    return yield prompt.password('Git Password: '.yellow);
}

function *validateArgs(options) {
    var isPublic, description = DEFAULT_DESCRIPTION;

    if (!options.username || options.username === '') {
        console.log('You didn\'t give me your username! -u <username>'.red);
        process.exit(0);
    }

    if (!options.public || options.public === '') {
        isPublic = false;
    }

    const username = options.username;
    const gistId = options.remove;
    const view = options.view;
    isPublic = options.public;

    if (options.description) {
        description = options.description;
    }

    return {username, gistId, isPublic, view, description}
}

function *showUserGists(username) {
    var password = yield requestUserPassword();
    var gitRequest = request.defaults({
        headers: {
            'User-Agent': 'ua'
        },
        auth: {
            'username': username,
            'password': password
        }
    });

    gitRequest(usersUrl + username + '/gists', function(err, resp, body) {
        if (err) {
            console.log(`Error: ${err}`.red);
            process.exit(0);
        }

        if (resp.statusCode === 403 || resp.statusCode === 401) {
            console.log(`Error: ${resp.statusMessage}`.red);
            process.exit(0);
        }

        var obj = JSON.parse(resp.body);
        var gists = Object.keys(obj).map(function (key) {
            return obj[key];
        });

        var newObj = {};
        console.log('File\t\t\t\t\tCreated Time\t\t\tID'.grey);
        for (var i = 0; i < gists.length; i++) {
            var gist = gists[i];
            console.log(Object.keys(gist.files)+'\t\t\t'+gist.created_at+'\t\t'+gist.id);
        }
    });
}

function createGist(args, title, fileContent) {
    co(function *() {
        const password = yield requestUserPassword();
        var client = new GitHub({
           username: args.username,
           password: password
        });

        var gist = client.getGist();

        gist.create({
            public: args.isPublic,
            description: args.description,
            files: {
                [title]: {
                    content: fileContent,
                }
            }
        }).then(function (resp) {
            if (resp.status === 201) {
                clipboard.copy(resp.data.html_url, () => {
                    co(function *() {
                        console.log('Yay, Gist created!'.green);
                        const choice = yield prompt('Do you wish to open your Gist in a broswer?: y/n '.yellow);
                        if (choice.toLowerCase() === 'y' || choice.toLowerCase() === 'yes') {
                            opn(resp.data.html_url);
                        } else {
                            console.log(`Copied Gist URL to clipboard!`.green);
                        }
                        process.exit(0)
                    });
                });
            } else if (!resp) {
                console.log('No response'.red);
                process.exit(0)
            }
        }).catch(function (err) {
            console.log('Error: Unale to authenticate you.'.red);
        });
    });
}

function *deleteGist(gistId, username) {
    try {
        const password = yield requestUserPassword();
        var gitRequest = request.defaults({
            headers: {
                'User-Agent': 'ua'
            },
            auth: {
                'username': username,
                'password': password
            }
        });

        const confirm = yield prompt('Are you sure you want to delete that Gist?: y/n '.yellow);

        if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
            gitRequest.delete(gistUrl + gistId, function(err, resp, body) {
                if (err) {
                    console.log(`Error: ${err}`.red);
                    process.exit(0);
                }

                if (resp.statusCode === 403 ||
                    resp.statusCode === 401 ||
                    resp.statusCode === 404) {
                    console.log(`Error: ${resp.statusMessage}`.red);
                    process.exit(0);
                } else {
                    console.log('Gist was deleted!'.green);
                    process.exit(0);
                }
            });
        } else {
            process.exit(0);
        }
    } catch(err) {
        console.log('Error: ' + err);
    }
}

commander
    .arguments('<file>')
    .option('-u, --username', 'The username of the GitHub account (Required)')
    .option('-v, --view', 'View authenticating users Gists')
    .option('-p, --isPublic', 'Set the visability of the Gist (default: false)')
    .option('-r, --remove', 'Delete a Gist given The ID (-d <gist-id>)')
    .option('-d, --description', 'Add a description to the Gist')
    .action(function(file) {
        co(function *() {

            const options = commandLineArgs(optionDefinitions)
            const args = yield validateArgs(options);

            const username = args.username;
            const gistId = args.gistId;

            if (!args.username) {
                console.log('No username given.'.red);
                process.exit(0);
            }

            if (args.view) {
                yield showUserGists(username);
                return;
            } else if (args.gistId) {
                yield deleteGist(gistId, username);
                return;
            } else {
                var title = path.basename(file);
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

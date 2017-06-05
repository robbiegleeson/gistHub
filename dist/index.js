#!/usr/bin/env node --harmony
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

require('babel-polyfill');

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _config = require('./options/config');

var config = _interopRequireWildcard(_config);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _marked = [requestUserPassword, validateArgs, showUserGists, deleteGist].map(regeneratorRuntime.mark);

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
const HOMEDIR = process.env[process.platform == 'WIN32' ? 'USERPROFILE' : 'HOME'];

const usersUrl = 'https://api.github.com/users/';
const gistUrl = 'https://api.github.com/gists/';

const optionDefinitions = [{ name: 'username', alias: 'u', type: String }, { name: 'file', type: String }, { name: 'public', alias: 'p', type: Boolean }, { name: 'remove', alias: 'r', type: String }, { name: 'description', alias: 'd', type: String }];

function requestUserPassword() {
    return regeneratorRuntime.wrap(function requestUserPassword$(_context) {
        while (1) switch (_context.prev = _context.next) {
            case 0:
                _context.next = 2;
                return prompt.password('Git Password: '.yellow);

            case 2:
                return _context.abrupt('return', _context.sent);

            case 3:
            case 'end':
                return _context.stop();
        }
    }, _marked[0], this);
}

function validateArgs(options) {
    var isPublic, description, userconfig, username, gistId, view;
    return regeneratorRuntime.wrap(function validateArgs$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
            case 0:
                description = DEFAULT_DESCRIPTION;
                userconfig = JSON.parse(configExists());


                if (!userconfig.username || userconfig.username === '') {
                    console.log('You didn\'t give me your username! -u <username>'.red);
                    process.exit(0);
                }

                if (!options.public || options.public === '') {
                    isPublic = false;
                }

                username = userconfig.username;
                gistId = options.remove;
                view = options.view;

                isPublic = options.public;

                if (options.description) {
                    description = options.description;
                }

                return _context2.abrupt('return', { username, gistId, isPublic, view, description });

            case 10:
            case 'end':
                return _context2.stop();
        }
    }, _marked[1], this);
}

function showUserGists(username) {
    var userconfig, gitRequest, resp, obj, gists, table, newObj, i, gist, answer, nextAnswer;
    return regeneratorRuntime.wrap(function showUserGists$(_context3) {
        while (1) switch (_context3.prev = _context3.next) {
            case 0:
                userconfig = JSON.parse(configExists());

                if (userconfig.password) {
                    _context3.next = 5;
                    break;
                }

                _context3.next = 4;
                return requestUserPassword();

            case 4:
                password = _context3.sent;

            case 5:

                password = userconfig.password;

                gitRequest = request.defaults({
                    headers: {
                        'User-Agent': 'ua'
                    },
                    auth: {
                        'username': username,
                        'password': password
                    }
                });


                gitRequest = thunkify(gitRequest);

                _context3.next = 10;
                return gitRequest(usersUrl + username + '/gists');

            case 10:
                resp = _context3.sent[0];

                spinner.stop();
                if (resp.statusCode === 403 || resp.statusCode === 401) {
                    console.log(`Error: ${resp.statusMessage}`.red);
                    process.exit(0);
                }

                obj = JSON.parse(resp.body);
                gists = Object.keys(obj).map(function (key) {
                    return obj[key];
                });
                table = new Table({
                    head: ['', 'Gist Name'],
                    colWidths: [10, 30]
                });
                newObj = {};

                for (i = 0; i < gists.length; i++) {
                    gist = gists[i];

                    table.push([i + 1, Object.keys(gist.files)]);
                }

                console.log(table.toString());
                if (!gists.length) {
                    process.exit(0);
                }

                _context3.next = 22;
                return prompt('Do you wish to delete any of the above gists: y/n '.yellow);

            case 22:
                answer = _context3.sent;

                if (!(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')) {
                    _context3.next = 33;
                    break;
                }

                _context3.next = 26;
                return prompt('Please enter the number you wish to delete '.yellow);

            case 26:
                nextAnswer = _context3.sent;

                if (!(!isNaN(parseInt(nextAnswer)) && parseInt(nextAnswer) <= gists.length && parseInt(nextAnswer) >= 1)) {
                    _context3.next = 32;
                    break;
                }

                _context3.next = 30;
                return deleteGist(gists[parseInt(nextAnswer) - 1].id, username, password);

            case 30:
                _context3.next = 33;
                break;

            case 32:
                console.log('The number you entered was not in the table above, please try again'.red);

            case 33:
                process.exit(0);

            case 34:
            case 'end':
                return _context3.stop();
        }
    }, _marked[2], this);
}

function createGist(args, title, fileContent) {
    co(regeneratorRuntime.mark(function _callee2() {
        var userconfig, password, client, gist, resp;
        return regeneratorRuntime.wrap(function _callee2$(_context5) {
            while (1) switch (_context5.prev = _context5.next) {
                case 0:
                    userconfig = JSON.parse(configExists());

                    if (userconfig.password) {
                        _context5.next = 5;
                        break;
                    }

                    _context5.next = 4;
                    return requestUserPassword();

                case 4:
                    password = _context5.sent;

                case 5:

                    password = userconfig.password;

                    client = new GitHub({
                        username: args.username,
                        password: password
                    });
                    gist = client.getGist();
                    _context5.next = 10;
                    return gist.create({
                        public: args.isPublic,
                        description: args.description,
                        files: {
                            [title]: {
                                content: fileContent
                            }
                        }
                    });

                case 10:
                    resp = _context5.sent;


                    if (resp.status === 201) {
                        clipboard.copy(resp.data.html_url, () => {
                            co(regeneratorRuntime.mark(function _callee() {
                                var choice;
                                return regeneratorRuntime.wrap(function _callee$(_context4) {
                                    while (1) switch (_context4.prev = _context4.next) {
                                        case 0:
                                            spinner.stop();
                                            console.log('Yay, Gist created!'.green);
                                            _context4.next = 4;
                                            return prompt('Do you wish to open your Gist in a broswer?: y/n '.yellow);

                                        case 4:
                                            choice = _context4.sent;

                                            if (choice.toLowerCase() === 'y' || choice.toLowerCase() === 'yes') {
                                                opn(resp.data.html_url);
                                            } else {
                                                console.log(`Copied Gist URL to clipboard!`.green);
                                            }
                                            process.exit(0);

                                        case 7:
                                        case 'end':
                                            return _context4.stop();
                                    }
                                }, _callee, this);
                            }));
                        });
                    } else if (!resp) {
                        console.log('No response'.red);
                        process.exit(0);
                    }

                case 12:
                case 'end':
                    return _context5.stop();
            }
        }, _callee2, this);
    }));
}

function deleteGist(gistId, username, password) {
    var gitRequest, confirm, resp;
    return regeneratorRuntime.wrap(function deleteGist$(_context6) {
        while (1) switch (_context6.prev = _context6.next) {
            case 0:
                _context6.prev = 0;
                gitRequest = request.defaults({
                    headers: {
                        'User-Agent': 'ua'
                    },
                    auth: {
                        'username': username,
                        'password': password
                    }
                });
                _context6.next = 4;
                return prompt('Are you sure you want to delete that Gist?: y/n '.yellow);

            case 4:
                confirm = _context6.sent;

                spinner.start();
                gitRequest.delete = thunkify(gitRequest.delete);

                if (!(confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes')) {
                    _context6.next = 12;
                    break;
                }

                _context6.next = 10;
                return gitRequest.delete(gistUrl + gistId);

            case 10:
                resp = _context6.sent[0];


                if (resp.statusCode === 403 || resp.statusCode === 401 || resp.statusCode === 404) {
                    console.log(`Error: ${resp.statusMessage}`.red);
                } else {
                    spinner.stop();
                    console.log('Gist was deleted!'.green);
                }

            case 12:
                _context6.next = 17;
                break;

            case 14:
                _context6.prev = 14;
                _context6.t0 = _context6['catch'](0);

                console.log('Error: ' + _context6.t0);

            case 17:
                process.exit(0);

            case 18:
            case 'end':
                return _context6.stop();
        }
    }, _marked[3], this, [[0, 14]]);
}

function saveConfig(params) {
    const userconfig = {
        username: params.username,
        password: params.password
    };

    if (!fs.existsSync(HOMEDIR + "/" + gist_config)) {
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

_commander2.default.command('reset').description('Remove existig configuration settings').action(function () {
    fs.stat(HOMEDIR + '/' + gist_config + '/user-config.json', function (err, stats) {
        if (err) {
            return console.error('Config file does not exist'.err);
            process.exit();
        }

        fs.unlink(HOMEDIR + '/' + gist_config + '/user-config.json', function (err) {
            if (err) return console.log(err);
            console.log('file deleted successfully'.green);
            process.exit();
        });
    });
});

_commander2.default.command('init').description('Configure your GitHub credentials').action(function () {
    co(regeneratorRuntime.mark(function _callee3() {
        return regeneratorRuntime.wrap(function _callee3$(_context7) {
            while (1) switch (_context7.prev = _context7.next) {
                case 0:
                    if (config.getConfig()) {
                        console.log('GistHub already configured'.red);
                        process.exit();
                    }

                    config.saveConfig({ username, password });
                    console.log('Success: Configuration complete'.green);
                    process.exit();

                case 4:
                case 'end':
                    return _context7.stop();
            }
        }, _callee3, this);
    }));
});

_commander2.default.command('test').action(function () {
    inquirer.prompt([{
        type: 'checkbox',
        name: 'choice',
        message: 'What do you want to do?',
        choices: ['Order a pizza', 'Make a reservation'] }]).then(function (answers) {
        console.log(JSON.stringify(answers, null, '  '));
    });
});

_commander2.default.command('view').description('View user gists').action(function () {
    co(regeneratorRuntime.mark(function _callee4() {
        var options, args, username;
        return regeneratorRuntime.wrap(function _callee4$(_context8) {
            while (1) switch (_context8.prev = _context8.next) {
                case 0:
                    if (!configExists()) {
                        console.log('App not set up. Please run gist init'.red);
                        process.exit();
                    }
                    spinner.start();
                    options = commandLineArgs(optionDefinitions);
                    _context8.next = 5;
                    return validateArgs(options);

                case 5:
                    args = _context8.sent;
                    username = args.username;
                    _context8.next = 9;
                    return showUserGists(username);

                case 9:
                case 'end':
                    return _context8.stop();
            }
        }, _callee4, this);
    }));
});

_commander2.default.arguments('<file>').option('-p, --isPublic', 'Set the visability of the Gist (default: false)').option('-r, --remove', 'Delete a Gist given The ID (-d <gist-id>)').option('-d, --description', 'Add a description to the Gist').action(function (file) {
    co(regeneratorRuntime.mark(function _callee5() {
        var options, args, username, gistId, title;
        return regeneratorRuntime.wrap(function _callee5$(_context9) {
            while (1) switch (_context9.prev = _context9.next) {
                case 0:
                    if (!configExists()) {
                        console.log('Please run gist init'.red);
                        process.exit();
                    }

                    options = commandLineArgs(optionDefinitions);
                    _context9.next = 4;
                    return validateArgs(options);

                case 4:
                    args = _context9.sent;
                    username = args.username;
                    gistId = args.gistId;


                    if (!args.username) {
                        console.log('No username given.'.red);
                        process.exit(0);
                    }

                    if (!args.gistId) {
                        _context9.next = 14;
                        break;
                    }

                    _context9.next = 11;
                    return deleteGist(gistId, username);

                case 11:
                    return _context9.abrupt('return');

                case 14:
                    title = path.basename(file);

                    spinner.start();
                    read(file, 'utf8')(function (err, fileContent) {
                        if (err) {
                            console.log('Unable to read file...'.red);
                            process.exit(0);
                        }

                        createGist(args, title, fileContent);
                    });

                case 17:
                case 'end':
                    return _context9.stop();
            }
        }, _callee5, this);
    })).catch(err => {
        console.log(`Error: ${err}`.red);
        process.exit(0);
    });
}).parse(process.argv);

exports.default = {
    config
};
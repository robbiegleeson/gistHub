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

const request = require('http');

const read = thunkify(fs.readFile);
const DEFAULT_DESCRIPTION = 'Created with gistHub | by Rob Gleeson';

function *validateArgs(processArgs) {
    var opts = {
        anonymous: String,
        email: String,
    };

    var shorthands = {
        a: '--anonymous',
        e: '--email',
    };

    var args = nopt(opts, shorthands, processArgs)

    if (!args.email || args.email === '') {
        console.log(chalk.red('You didn\'t give me your email! -e <email>'));
        process.exit(0);
    }

    if (!args.anonymous || !args.anonymous === '') {
        console.log(chalk.red('Please set the Gist visability. -a <boolean>'));
        process.exit(0);
    }

    var password = yield prompt.password('Git password: ');
    var email = args.email;
    var anonymous = args.anonymous;

    return {password, email, anonymous}
}

program
    .arguments('<file>')
    .option('-a, --anonymous', 'Set the visability of the Gist (Required)' )
    .option('-e, --email', 'The email of the GitHub account (Required)')
    .action(function(file) {
        co(function *() {
            const args = yield validateArgs(process.argv);

            var title = path.basename(file);

            read(file, 'utf8')(function (err, str) {
                if (err) {
                    console.log(chalk.red('Unable to read file...'));
                    process.exit(0);
                }

                var gh = new GitHub({
                   username: args.email,
                   password: args.password
                });

                var gist = gh.getGist();

                gist.create({
                    public: args.anonymous,
                    description: DEFAULT_DESCRIPTION,
                    files: {
                        [title]: {
                            content: str,
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
            });
        }).catch((err) => {
            console.log(chalk.red(`Error: ${err}`));
            process.exit(0);
        });
}).parse(process.argv);

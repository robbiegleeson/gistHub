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

const read = thunkify(fs.readFile);
const DEFAULT_DESCRIPTION = 'Created with gistHub | by Rob Gleeson';

program
    .arguments('<file>')
    .option('-a, --anonymous', 'Set the visability of the Gist (default: false)' )
    .option('-e, --email', 'The email of the GitHub account')
    .option('-p, --password', 'The passwork for the GitHub account')
    .action(function(file) {
        co(function *() {
            var opts = {
                anonymous: Boolean,
                email: String,
                password: String
            };

            var shorthands = {
                a: '--anonymous',
                e: '--email',
                p: '--password'
            };

            var args = nopt(opts, shorthands, process.argv)

            var email, username;
            if (!args.email || !args.password) {
                email = yield prompt('email: ');
                password = yield prompt.password('password: ');
            }

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
                            console.log(chalk.green('Yay, Gist created!'));
                            console.log(chalk.green(`Copied Gist URL to clipboard!`));
                            process.exit(0)
                        });
                    }
                });
            });
        }).catch((err) => {
            console.log(chalk.red(`Error: ${err}`));
            process.exit(0);
        });
}).parse(process.argv);

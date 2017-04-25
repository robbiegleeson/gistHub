#!/usr/bin/env node --harmony
const program = require('commander');
const co = require('co');
const prompt = require('co-prompt');
const GitHub = require('github-api');
const thunkify = require('thunkify');
const fs = require('fs');
const clipboard = require('copy-paste');
const chalk = require('chalk');
var path = require('path');

const read = thunkify(fs.readFile);
const DEFAULT_DESCRIPTION = 'Created with gistHub | by Rob Gleeson';

program
    .arguments('<file>')
    .option('-p, --public', 'Set the visability of the Gist (default: false)' )
    .action(function(file) {
        co(function *() {
            var email = yield prompt('email: ');
            var password = yield prompt.password('password: ');
            var title = path.basename(file);

            read(file, 'utf8')(function (err, str) {
                if (err) {
                    console.log(chalk.red('Unable to read file...'));
                    process.exit(0);
                }

                var gh = new GitHub({
                   username: email,
                   password: password
                });

                var gist = gh.getGist();

                gist.create({
                    public: program.public,
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

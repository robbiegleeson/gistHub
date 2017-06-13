#!/usr/bin/env node --harmony
import 'babel-polyfill';
import program from 'commander';
import init from './options/init';
import * as git from './options/git';
import * as config from './config';

const currVersion = require('../package.json').version;

program
  .version(currVersion)
  .command('init')
  .alias('i')
  .description('Initialize the application')
  .action(command => init(command));

program
  .arguments('<file>')
  .alias('a')
  .description('Create a new Gist: gist <../path-to-file> [options]')
  .option('-p, --isPublic', 'Set the visability of the Gist (default: false)')
  .option('-r, --remove', 'Delete a Gist given The ID (-d <gist-id>)')
  .option('-d, --description', 'Add a description to the Gist')
  .action((file, options) => git.createGist(file, options));

program
  .command('view')
  .alias('v')
  .description('View user Gists')
  .action(command => git.viewGists(command));

program
  .command('reset')
  .alias('r')
  .description('Reset user configuration')
  .action(command => config.reset(command));

program.on('*', (command) => {
  console.log(`The command '${command}' does not exist`);
  console.log(`Please refer to the help section ${'gist -h'} for options`);
});

program.parse(process.argv);

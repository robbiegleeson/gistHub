#!/usr/bin/env node --harmony
import 'babel-polyfill';
import program from 'commander';
import init from './options/init';
import * as git from './options/git';
import * as config from './config';

program
  .command('init')
  .alias('i')
  .description('Initialize the application')
  .action(command => init(command));

program
  .arguments('<file>')
  .alias('a')
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

program.parse(process.argv);

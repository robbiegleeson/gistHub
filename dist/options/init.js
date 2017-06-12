'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = init;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _colors = require('colors');

var _colors2 = _interopRequireDefault(_colors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const HOMEDIR = process.env[process.platform == 'WIN32' ? 'USERPROFILE' : 'HOME'];
const gistConfig = ".config";

function init() {
  if (doesConfigExist()) {
    console.log('Already set up'.green);
    process.exit();
  }

  createUserConfing();
}

function doesConfigExist() {
  return _fs2.default.existsSync(`${HOMEDIR}/${gistConfig}/user-config.json`);
}

function createUserConfing() {
  var questions;
  return regeneratorRuntime.async(function createUserConfing$(_context) {
    while (1) switch (_context.prev = _context.next) {
      case 0:
        questions = [{
          type: 'input',
          name: 'username',
          message: 'Enter your Github username or email'
        }, {
          type: 'password',
          name: 'password',
          message: 'Enter your Github pasword'
        }];


        _inquirer2.default.prompt(questions).then(ans => {
          try {
            if (!_fs2.default.existsSync(`${HOMEDIR}/${gistConfig}`)) {
              _fs2.default.mkdir(`${HOMEDIR}/${gistConfig}`);
              _fs2.default.writeFileSync(`${HOMEDIR}/${gistConfig}/user-config.json`, JSON.stringify(ans));
              console.log(`Success: confituration saved`.green);
            } else {
              _fs2.default.writeFileSync(`${HOMEDIR}/${gistConfig}/user-config.json`, JSON.stringify(ans));
              console.log(`Success: confituration saved`.green);
            }
          } catch (error) {
            console.log(`Error: ${error}`.red);
          }
        });

      case 2:
      case 'end':
        return _context.stop();
    }
  }, null, this);
}
'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _colors = require('colors');

var _colors2 = _interopRequireDefault(_colors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*eslint-enable */

const HOMEDIR = process.env[process.platform === 'WIN32' ? 'USERPROFILE' : 'HOME'];
/*eslint-disable */

const gistConfig = '.config';

function getUserConfig() {
  if (!_fs2.default.existsSync(`${HOMEDIR}/${gistConfig}`)) {
    return null;
  }

  if (!_fs2.default.existsSync(`${HOMEDIR}/${gistConfig}/user-config.json`)) {
    return null;
  }

  return JSON.parse(_fs2.default.readFileSync(`${HOMEDIR}/${gistConfig}/user-config.json`));
}

function reset() {
  _fs2.default.stat(`${HOMEDIR}/${gistConfig}/user-config.json`, err => {
    if (err) {
      console.error('Config file does not exist'.err);
      process.exit();
    }

    _fs2.default.unlink(`${HOMEDIR}/${gistConfig}/user-config.json`, error => {
      if (error) return console.log(error);
      return console.log('Config reset successfully'.green);
    });
  });
}

module.exports = {
  getUserConfig,
  reset
};
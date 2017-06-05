'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getConfig = getConfig;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _co = require('co');

var _co2 = _interopRequireDefault(_co);

var _coPrompt = require('co-prompt');

var _coPrompt2 = _interopRequireDefault(_coPrompt);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const HOMEDIR = process.env[process.platform == 'WIN32' ? 'USERPROFILE' : 'HOME'];
const gist_config = "gistConfig";

function saveConfig() {
  (0, _co2.default)(regeneratorRuntime.mark(function _callee() {
    var username, password, userconfig;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return (0, _coPrompt2.default)('Enter you GitHub username or email: '.yellow);

        case 2:
          username = _context.sent;
          _context.next = 5;
          return _coPrompt2.default.password('Enter your GitHub password: '.yellow);

        case 5:
          password = _context.sent;
          userconfig = {
            username,
            password
          };


          if (!_fs2.default.existsSync(HOMEDIR + "/" + gist_config)) {
            _fs2.default.mkdir(HOMEDIR + "/" + gist_config);
            _fs2.default.writeFileSync(HOMEDIR + "/" + gist_config + "/config.json", JSON.stringify(userconfig));
          } else {
            _fs2.default.writeFileSync(HOMEDIR + "/" + gist_config + "/config.json", JSON.stringify(userconfig));
          }

        case 8:
        case 'end':
          return _context.stop();
      }
    }, _callee, this);
  }));
}

function getConfig() {
  if (!_fs2.default.existsSync(HOMEDIR + '/' + gist_config)) {
    saveConfig();
  }

  if (!_fs2.default.existsSync(HOMEDIR + '/' + gist_config + '/config.json')) {
    saveConfig();
  }
  return _fs2.default.readFileSync(HOMEDIR + '/' + gist_config + '/config.json');
}

exports.default = {
  getConfig
};
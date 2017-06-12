
import fs from 'fs';
/*eslint-disable */
import colors from 'colors';
/*eslint-enable */

const HOMEDIR = process.env[(process.platform === 'WIN32') ? 'USERPROFILE' : 'HOME'];
const gistConfig = '.config';

function getUserConfig() {
  if (!fs.existsSync(`${HOMEDIR}/${gistConfig}`)) {
    return null;
  }

  if (!fs.existsSync(`${HOMEDIR}/${gistConfig}/user-config.json`)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(`${HOMEDIR}/${gistConfig}/user-config.json`));
}

function reset() {
  fs.stat(`${HOMEDIR}/${gistConfig}/user-config.json`, (err) => {
    if (err) {
      console.error('Config file does not exist'.err);
      process.exit();
    }

    fs.unlink(`${HOMEDIR}/${gistConfig}/user-config.json`, (error) => {
      if (error) return console.log(error);
      return console.log('Config reset successfully'.green);
    });
  });
}

module.exports = {
  getUserConfig,
  reset,
};

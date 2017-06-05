import fs from 'fs';
import co from 'co';
import prompt from 'co-prompt';

const HOMEDIR = process.env[(process.platform == 'WIN32') ? 'USERPROFILE' : 'HOME'];
const gist_config = "gistConfig";

function saveConfig() {
  co(function *() {
    const username = yield prompt('Enter you GitHub username or email: '.yellow);
    const password = yield prompt.password('Enter your GitHub password: '.yellow);

    const userconfig = {
        username,
        password,
    };

    if(!fs.existsSync(HOMEDIR + "/" + gist_config)) {
      fs.mkdir(HOMEDIR + "/" + gist_config);
      fs.writeFileSync(HOMEDIR + "/" + gist_config + "/config.json", JSON.stringify(userconfig));
    } else {
      fs.writeFileSync(HOMEDIR + "/" + gist_config + "/config.json", JSON.stringify(userconfig));
    }
  })
}

export function getConfig() {
  if (!fs.existsSync(HOMEDIR + '/' + gist_config)) {
    saveConfig();
  }

  if (!fs.existsSync(HOMEDIR + '/' + gist_config + '/config.json')) {
    saveConfig();
  }
  return fs.readFileSync(HOMEDIR + '/' + gist_config + '/config.json');
}

export default {
  getConfig,
}

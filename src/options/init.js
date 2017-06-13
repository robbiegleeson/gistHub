import fs from 'fs';
import inquirer from 'inquirer';
import colors from 'colors';

const HOMEDIR = process.env[(process.platform == 'WIN32') ? 'USERPROFILE' : 'HOME'];
const gistConfig = ".config";

export default function init() {
  if (doesConfigExist()) {
    console.log('Already set up'.green);
    process.exit();
  }

  createUserConfing();
}

function doesConfigExist() {
  return fs.existsSync(`${HOMEDIR}/${gistConfig}/user-config.json`);
}

async function createUserConfing() {
  const questions = [
    {
      type: 'input',
      name: 'username',
      message: 'Enter your Github username or email',
    },
    {
      type: 'password',
      name: 'password',
      message: 'Enter your Github pasword',
    },
  ];

  inquirer.prompt(questions)
    .then((ans) => {
      try {
        if(!fs.existsSync(`${HOMEDIR}/${gistConfig}`)) {
        	fs.mkdir(`${HOMEDIR}/${gistConfig}`);
          fs.writeFileSync(`${HOMEDIR}/${gistConfig}/user-config.json`, JSON.stringify(ans));
          console.log(`Success: confituration saved`.green);
        } else {
          fs.writeFileSync(`${HOMEDIR}/${gistConfig}/user-config.json`, JSON.stringify(ans));
          console.log(`Success: confituration saved`.green);
        }
      } catch (error) {
        console.log(`Error: ${error}`.red);
      }
    })
}

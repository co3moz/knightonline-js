const glob = require('glob');
const path = require('path');

module.exports = async (db) => {
  process.stdout.write('loading models: ');

  await new Promise((resolve, reject) => {
    glob(path.resolve(__dirname, './models/**/*.js'), (err, files) => {
      if (err) {
        console.log('model loader failed!');
        reject(err);
        return;
      }

      for (let file of files) {
        require(file)(db);
      }

      console.log('model loader ok!');
      resolve();
    });
  });
}
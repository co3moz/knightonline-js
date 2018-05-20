const glob = require('glob');
const path = require('path');

module.exports = async (db) => {
  await new Promise((resolve, reject) => {
    glob(path.resolve(__dirname, '../models/**/*.js'), (err, files) => {
      if (err) {
        console.log('model loader failed!');
        reject(err);
        return;
      }

      try {

        for (let file of files) {
          require(file)(db);
        }

      } catch (e) {
        console.log('model loader failed!');
        reject(e);
        return;
      }

      console.log('model loader ok!');
      resolve();
    });
  });
}
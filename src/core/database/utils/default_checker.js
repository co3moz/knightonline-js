const glob = require('glob');
const path = require('path');

module.exports = async (db) => {
  await new Promise((resolve, reject) => {
    glob(path.resolve(__dirname, '../defaults/**/*.js'), async (err, files) => {
      if (err) {
        console.log('default checker failed!');
        reject(err);
        return;
      }

      let file;
      try {
        for (file of files) {
          let lib = require(file);
          await lib(db);
        }
      } catch (e) {
        console.error('default checker failed! at ' + file);
        reject(e);
        return;
      }

      resolve();
    });
  });
}
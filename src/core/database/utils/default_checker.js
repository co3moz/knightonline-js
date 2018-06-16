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

      try {
        for (let file of files) {
          await require(file)(db);
        }
      } catch (e) {
        console.log('default checker failed!');
        reject(e);
        return;
      }

      resolve();
    });
  });
}
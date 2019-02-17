import * as glob from 'glob'
import * as path from 'path'

export default function DefaultChecker() {
  return new Promise((resolve, reject) => {
    glob(path.resolve(__dirname, '../defaults/**/*.ts'), async (err, files) => {
      if (err) {
        console.error('default checker failed!');
        return reject(err);
      }

      let file;
      try {
        for (file of files) {
          let lib = await <any>import(file);
          await lib();
        }
      } catch (e) {
        console.error('default checker failed! at ' + file);
        return reject(e);
      }

      resolve();
    });
  });
}
import * as glob from 'glob'
import * as path from 'path'

export function ModelLoader() {
  return new Promise((resolve, reject) => {
    glob(path.resolve(__dirname, '../models/**/*.ts'), async (err, files) => {
      if (err) {
        console.error('model loader failed!');
        return reject(err);
      }

      try {
        for (let file of files) {
          await import(file);
        }

      } catch (e) {
        console.error('model loader failed!');
        return reject(e);
      }

      resolve();
    });
  });
}
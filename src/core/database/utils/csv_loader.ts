import { Model } from 'mongoose';
import * as csv from 'csv-streamify'
import * as unzip from 'unzip'
import * as fs from 'fs'
import * as path from 'path'

export async function CSVLoader(file: string, transfer: object, expected: number, model: Model<any>): Promise<boolean> {
  if (await model.findOne({}).exec()) {
    return false;
  }

  let dataPath = path.resolve(__dirname, '../../../../data/');
  let zipPath = path.resolve(dataPath, file + '.zip');
  let csvPath = path.resolve(dataPath, file + '.csv');

  return await new Promise((resolve) => {
    let extract: NodeJS.WritableStream = <any>unzip.Extract({ path: dataPath });

    fs.createReadStream(zipPath).pipe(extract);

    extract.on('close', () => {
      console.log('[CSV] ' + file + '.zip unzipped');

      let arr = [];
      const parser = csv({ columns: true, newline: '\r\n', })
      parser.on('data', (data) => {
        var obj = {};

        validObj(obj, data, transfer);

        arr.push(new model(obj));
      });

      fs.createReadStream(csvPath).pipe(parser);

      (async function () {
        let total = 0;
        while (arr.length == 0) await delay(500);

        while (arr.length) {
          parser.pause();
          await model.insertMany(arr);
          total += arr.length;
          console.log('[CSV] ' + file + ' patch sent %d status: %f %', total, (total / expected * 1000 | 0) / 10);
          arr = [];
          parser.resume();
          await delay(500);
        }

        console.log('[CSV] ' + file + '.csv completed');

        fs.unlink(csvPath, function () {
          console.log('[CSV] ' + file + '.csv removed');

          resolve(true);
        });
      })()
    });
  });
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

var validAdd = (obj, data, field, newField) => {
  var val = data[field].trim();

  if (!(val == '' || val == '0' || val == 'NULL')) {
    obj[newField] = val;
  }
}

function validObj(obj, data, cont) {
  for (var key in cont) {
    validAdd(obj, data, key, cont[key]);
  }
}
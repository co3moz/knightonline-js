import * as csv from 'csv-streamify'
import * as unzip from 'unzip'
import * as fs from 'fs'
import * as path from 'path'


export async function CSVReader(file: string, transfer: object, expected: number): Promise<any[]> {
  let dataPath = path.resolve(__dirname, '../../../../data/');
  let zipPath = path.resolve(dataPath, file + '.zip');
  let csvPath = path.resolve(dataPath, file + '.csv');

  return new Promise(resolve => {
    let extract: NodeJS.WritableStream = <any>unzip.Extract({ path: dataPath });
    fs.createReadStream(zipPath).pipe(extract);

    extract.on('close', () => {
      console.log(file + '.zip unzipped for reading');

      let arr = [];
      let patch = []
      const parser = csv({ columns: true, newline: '\r\n', })
      parser.on('data', (data) => {
        var obj = {};

        validObj(obj, data, transfer);

        arr.push(obj);
      });

      fs.createReadStream(csvPath).pipe(parser);

      (async function () {
        let total = 0;
        while (arr.length == 0) await delay(500);

        while (arr.length) {
          parser.pause();

          popAndPushArray(arr, patch);

          total += arr.length;
          console.log(file + ' patch read %d status: %f %', total, (total / expected * 1000 | 0) / 10);
          arr = [];
          parser.resume();
          await delay(500);
        }

        console.log(file + '.csv read completed');

        fs.unlink(csvPath, function () {
          console.log(file + '.csv removed');

          resolve(patch);
        });
      })()
    });
  });
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const popAndPushArray = (from: any[], to: any[]) => {
  while (from.length) {
    to.push(from.pop());
  }
}

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
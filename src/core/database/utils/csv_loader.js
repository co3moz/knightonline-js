const csv = require('csv-streamify');
const unzip = require('unzip');
const fs = require('fs');
const path = require('path');


const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = async function ({ db, modelName, file, transfer, expected }) {
  let model = db.models[modelName];

  if (await model.findOne({}).exec()) {
    return;
  }

  await new Promise(resolve => {
    let extract = unzip.Extract({ path: path.resolve(__dirname, '../../../../data/') })
    fs.createReadStream(path.resolve(__dirname, '../../../../data/' + file + '.zip')).pipe(extract);
    extract.on('close', function () {
      console.log(file + '.zip unzipped');

      var arr = [];

      const parser = csv({ columns: true, newline: '\r\n', })

      parser.on('data', (data) => {
        var obj = {};

        validObj(obj, data, transfer);

        arr.push(new model(obj));
      });


      fs.createReadStream(path.resolve(__dirname, '../../../../data/' + file + '.csv')).pipe(parser);

      (async function () {
        let total = 0;
        while (arr.length == 0) await delay(500);

        while (arr.length) {
          parser.pause();
          await model.insertMany(arr);
          total += arr.length;
          console.log(file + ' patch sent %d status: %f %', total, parseInt(total / expected * 1000) / 10);
          arr = [];
          parser.resume();
          await delay(500);
        }

        console.log(file + '.csv completed');

        fs.unlink(path.resolve(__dirname, '../../../../data/' + file + '.csv'), function () {
          console.log(file + '.csv removed');

          resolve();
        });
      })()
    });
  });
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
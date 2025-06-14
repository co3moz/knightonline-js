import { Model } from "mongoose";
import csv from "csv-streamify";
import unzip from "extract-zip";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function CSVLoader(
  file: string,
  transfer: object,
  expected: number,
  model: Model<any>
): Promise<boolean> {
  if (await model.findOne({}).exec()) {
    return false;
  }

  let dataPath = path.resolve(__dirname, "../../../../data/");
  let zipPath = path.resolve(dataPath, file + ".zip");
  let csvPath = path.resolve(dataPath, file + ".csv");

  return await new Promise(async (resolve) => {
    await unzip(zipPath, {
      dir: dataPath,
    });

    console.log("[CSV] " + file + ".zip unzipped");

    let arr = [];
    const parser = csv({ columns: true, newline: "\r\n" });
    parser.on("data", (data) => {
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
        console.log(
          "[CSV] " + file + " patch sent %d status: %f %",
          total,
          (((total / expected) * 1000) | 0) / 10
        );
        arr = [];
        parser.resume();
        await delay(500);
      }

      console.log("[CSV] " + file + ".csv completed");

      fs.unlink(csvPath, function () {
        console.log("[CSV] " + file + ".csv removed");

        resolve(true);
      });
    })();
  });
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

var validAdd = (obj, data, field, newField) => {
  var val = data[field].trim();

  if (!(val == "" || val == "0" || val == "NULL")) {
    obj[newField] = val;
  }
};

function validObj(obj, data, cont) {
  for (var key in cont) {
    validAdd(obj, data, key, cont[key]);
  }
}

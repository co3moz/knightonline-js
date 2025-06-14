import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Calculates the time difference in nanoseconds
 */
export class TimeDifference {
  private startAt: [number, number];

  private constructor() {
    this.startAt = process.hrtime();
  }

  /**
   * Creates the instance at the begining
   */
  public static begin() {
    return new TimeDifference();
  }

  /**
   * Finishes the time, returns data in milliseconds
   */
  end(): number {
    let diff = process.hrtime(this.startAt);

    return diff[0] * 1000 + diff[1] / 1e6;
  }
}

/**
 * This will be handy function for IO safety.
 */
export function WaitNextTick(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}

/**
 * Triggers garbage collection. (THIS WILL LOCK THE EVENT LOOP)
 */
export function GarbageCollect() {
  if (global.gc) {
    global.gc();
  }
}

/**
 * Loads the package.json file and returns as json object.
 */
export function GetPackageJSON(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (_packageJSON) return resolve(_packageJSON);

    fs.readFile(
      path.resolve(__dirname, "../../../package.json"),
      (err, data) => {
        if (err) {
          reject(err);
        } else {
          try {
            resolve((_packageJSON = JSON.parse(data.toString())));
          } catch (e) {
            reject(e);
          }
        }
      }
    );
  });
}

let _packageJSON = null;

import { glob } from "glob";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function DefaultChecker() {
  try {
    const files = await glob(path.resolve(__dirname, "../defaults/**/*.ts"));

    for (let file of files) {
      let lib = await (<any>import(file));
      await lib();
    }
  } catch (e) {
    console.error("default checker failed!");
    throw e;
  }
}

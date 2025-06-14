import { glob } from "glob";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function ModelLoader() {
  try {
    const files = await glob(path.resolve(__dirname, "../models/**/*.ts"));

    for (let file of files) {
      await import(file);
    }
  } catch (e) {
    console.error("model loader failed!");
    throw e;
  }
}

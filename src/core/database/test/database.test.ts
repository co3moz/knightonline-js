import { Spec } from "nole";
import { Database } from "../index.js";

export class DatabaseTest {
  @Spec(60000)
  async Connect() {
    await Database();
  }
}

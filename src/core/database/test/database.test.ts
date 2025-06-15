import { Database } from "@/database";
import { Spec } from "nole";

export class DatabaseTest {
  @Spec(60000)
  async Connect() {
    await Database();
  }
}

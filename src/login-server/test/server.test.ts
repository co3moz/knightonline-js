import { Spec, Hook, Dependency } from "nole";
import { LoginServer } from "../server.js";
import type { IKOServer } from "../../core/server.js";
import { DatabaseTest } from "../../core/database/test/database.test.js";

export class LoginServerTest {
  @Dependency(DatabaseTest)
  databaseTest: DatabaseTest;

  servers: IKOServer[];

  @Spec(250)
  async StartServer() {
    this.servers = await LoginServer();
  }
}

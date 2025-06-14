import { assert } from "chai";
import { Spec, Hook, Dependency } from "nole";
import { LoginServer } from "../server";
import type { IKOServer } from "../../core/server";
import { DatabaseTest } from "../../core/database/test/database.test";

export class LoginServerTest {
  @Dependency(DatabaseTest)
  databaseTest: DatabaseTest;

  servers: IKOServer[];

  @Spec(250)
  async StartServer() {
    this.servers = await LoginServer();
  }
}

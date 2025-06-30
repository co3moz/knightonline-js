import { assert } from "chai";
import { Spec, Dependency } from "nole";
import { LoginServerTest } from "../../login-server/test/server.test.js";
import { ConnectKOServerForLauncher } from "../launcher-client.js";

export class ClientLauncherTest {
  @Dependency(LoginServerTest)
  loginServerTest: LoginServerTest;

  data;

  @Spec(20)
  async Connect() {
    let ports = this.loginServerTest.servers[0].params.ports;
    let randomPort = ports[(Math.random() * ports.length) | 0];
    this.data = await ConnectKOServerForLauncher("127.0.0.1", randomPort);
  }

  @Spec()
  Validate() {
    let data = this.data;
    assert.isObject(data);
    assert.equal(data.ftpAddress, "localhost");
    assert.equal(data.ftpRoot, "/");
    assert.isArray(data.ftpFiles);
    assert.equal(data.ftpFiles.length, 1);
  }
}

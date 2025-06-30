import { assert } from "chai";
import { Spec, Dependency } from "nole";
import { LoginServerTest } from "../../login-server/test/server.test.js";
import { ConnectLoginClient } from "../login-client.js";

export class ClientLoginTest {
  @Dependency(LoginServerTest)
  loginServerTest: LoginServerTest;

  data;

  @Spec(80)
  async Connect() {
    let ports = this.loginServerTest.servers[0].params.ports;
    let randomPort = ports[(Math.random() * ports.length) | 0];
    this.data = await ConnectLoginClient("127.0.0.1", randomPort, "test", "1");
  }

  @Spec()
  Validate() {
    let data = this.data;
    assert.isString(data.sessionCode);
    assert.isArray(data.servers);
    assert.isObject(data.news);
    assert.isString(data.news.header);
    assert.isString(data.news.message);
    assert.isNumber(data.premiumHours);
  }
}

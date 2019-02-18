import * as config from 'config'
import { Database } from '../core/database'
import { RedisConnect } from '../core/redis/connect'
import { KOServerFactory } from '../core/server';
import { Queue } from '../core/utils/unit';
import { LoginEndpointCodes, LoginEndpoint } from './endpoint';
import { ILoginSocket } from './login_socket';

export default async function LoginServer() {
  console.log('login server is going to start...');
  await Database();
  await RedisConnect();

  let versions: any[] = config.get('loginServer.versions');
  let { version: serverVersion } = versions[versions.length - 1];

  console.log('looks like latest server version is ' + serverVersion);

  return await KOServerFactory({
    ip: config.get('loginServer.ip'),
    ports: config.get('loginServer.ports'),
    timeout: 5000,

    onData: async (socket: ILoginSocket, data: Buffer) => {
      let body = Queue.from(data);
      let opcode = body.byte();
      if (!LoginEndpointCodes[opcode]) return;

      let endpoint = LoginEndpoint(LoginEndpointCodes[opcode]);
      if (!endpoint) return;

      await endpoint(socket, body, opcode)
    }
  });
}



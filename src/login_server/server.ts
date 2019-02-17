import * as config from 'config'
import Database from '../core/database'
import RedisConnect from '../core/redis/connect'
import { ServerFactory, ISocket } from '../core/server';
import { Queue } from '../core/utils/unit';
import { LoginEndpointCodes, LoginEndpointResolver } from './endpoint';

export default async function LoginServer() {
  console.log('login server is going to start...');
  await Database();
  await RedisConnect();

  let versions: any[] = config.get('loginServer.versions');
  let { version: serverVersion } = versions[versions.length - 1];

  console.log('looks like latest server version is ' + serverVersion);

  return await ServerFactory({
    ip: config.get('loginServer.ip'),
    ports: config.get('loginServer.ports'),
    timeout: 5000,

    onData: async (socket: ISocket, data: Buffer) => {
      let body = Queue.from(data);
      let opcode = body.byte();
      if (!LoginEndpointCodes[opcode]) return;

      let endpoint = await LoginEndpointResolver(LoginEndpointCodes[opcode])

      await endpoint(socket, body, opcode)
    }
  });
}



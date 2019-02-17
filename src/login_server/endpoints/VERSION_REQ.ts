import * as config from 'config'
import { short, Queue } from '../../core/utils/unit';
import { ILoginSocket } from '../login_socket';
import { ILoginEndpoint } from '../endpoint';

let versions: any[] = config.get('loginServer.versions');
let { version: serverVersion } = versions[versions.length - 1];

export default <ILoginEndpoint>async function (socket: ILoginSocket, body: Queue, opcode: number) {
  let clientVersion = body.short();

  socket.send([
    opcode,
    ...short(serverVersion)
  ]);
}
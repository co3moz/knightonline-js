import * as config from 'config'
import { Queue, string, configString, short } from '../../core/utils/unit';
import { ILoginSocket } from '../login_socket';
import { ILoginEndpoint } from '../endpoint';

let versions: any[] = config.get('loginServer.versions');

export const DOWNLOADINFO_REQ: ILoginEndpoint = async function (socket: ILoginSocket, body: Queue, opcode: number) {
  let result = [];
  let totalFile = 0;
  let clientVersion = body.short();

  for (let version of versions) {
    if (version.version > clientVersion) {
      totalFile++;
      result.push(...string(version.fileName));
    }
  }

  socket.send([
    opcode,
    ...configString('loginServer.ftp.host'),
    ...configString('loginServer.ftp.dir'),
    ...short(totalFile),
    ...result
  ]);
}
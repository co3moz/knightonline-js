import * as config from 'config'
import { Queue, string, configString, short } from '../../core/utils/unit';
import { ILoginSocket } from '../login_socket';
import { ILoginEndpoint } from '../endpoint';

let versions: any[] = config.get('loginServer.versions');

export const DOWNLOADINFO_REQ: ILoginEndpoint = async function (socket: ILoginSocket, body: Queue, opcode: number) {
  let downloadSet = [];
  let clientVersion = body.short();

  for (let version of versions) {
    if (version.version > clientVersion) {
      downloadSet.push(string(version.fileName));
    }
  }

  socket.send([
    opcode,
    ...configString('loginServer.ftp.host'),
    ...configString('loginServer.ftp.dir'),
    ...short(downloadSet.length),
    ...[].concat(...downloadSet)
  ]);
}
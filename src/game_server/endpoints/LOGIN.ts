import { IGameEndpoint } from "../endpoint";
import { IGameSocket } from "../game_socket";
import { Queue, string } from "../../core/utils/unit";
import { Account } from '../../core/database/models';
import { UserMap } from '../shared';

export const LOGIN: IGameEndpoint = async function (socket: IGameSocket, body: Queue, opcode: number) {
  let sessionCode = body.string();
  let password = body.string();

  if (socket.user) {
    return; // don't allow this request if user already login
  }

  if ((sessionCode.length != 30 || password.length > 28)) {
    socket.terminate('invalid credentails');
    return;
  }

  let user = await Account.findOne({
    _id: sessionCode.substring(6, 30)
  }).exec();

  if (!user || user.session != sessionCode || user.password != password) {
    socket.terminate('invalid credentails');
    return;
  }

  let activeSocket = UserMap[user.account];

  socket.setTimeout(10 * 60 * 1000); // 10 mins

  if (activeSocket && activeSocket != socket) {
    activeSocket.send([
      0x10, 7, activeSocket.user.nation, 0, 0, 0,
      ...string('[SERVER] Hesabiniza ' + socket.remoteAddress + ' ip adresinden yeni bir baglanti yapildi!', 'ascii')
    ]);

    await new Promise(r => setTimeout(r, 100));
    await activeSocket.terminate('another login request');
  }

  socket.user = user;
  UserMap[user.account] = socket;

  socket.send([
    opcode,
    user.characters.length == 0 ? 0 : (user.nation & 0xFF) // if there is no character available, then allow user to change nation
  ]);
}
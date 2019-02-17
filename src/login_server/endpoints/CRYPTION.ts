import { Queue } from '../../core/utils/unit';
import { ILoginSocket } from '../login_socket';
import { ILoginEndpoint } from '../endpoint';
import Crypt from '../../core/utils/crypt';

export default <ILoginEndpoint>async function (socket: ILoginSocket, body: Queue, opcode: number) {
  if (!socket.cryption) {
    socket.cryption = Crypt.createInstance();
  }

  socket.send([
    opcode,
    ...socket.cryption.publicKey()
  ]);
}
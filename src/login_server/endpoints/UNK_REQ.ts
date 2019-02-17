import { Queue } from '../../core/utils/unit';
import { ILoginSocket } from '../login_socket';
import { ILoginEndpoint } from '../endpoint';

export default <ILoginEndpoint>async function (socket: ILoginSocket, body: Queue, opcode: number) {
  socket.send([
    0xFD, 0, 0
  ]);
}
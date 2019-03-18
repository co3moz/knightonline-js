import { IGameEndpoint } from "../endpoint";
import { IGameSocket } from "../game_socket";
import { Queue, byte_string, short } from "../../core/utils/unit";
import { RegionZoneQuery } from "../region";

export const USER_INFO: IGameEndpoint = async function (socket: IGameSocket, body: Queue, opcode: number) {
  let c = socket.character;
  let subOpcode = body.byte();

  if (subOpcode == 0x01) { // send all user data in same zone
    let result = [opcode, subOpcode, 1, c.zone, 0, 0, 0]; // last 0, 0 is count
    let userCount = 0;
    for (let userSocket of RegionZoneQuery(socket)) { // request all users in the zone
      userCount++;

      let uc = userSocket.character;
      result.push(...byte_string(uc.name));
      result.push(userSocket.user.nation);
      result.push(1, 0);
      result.push(...short(uc.x * 10));
      result.push(...short(uc.z * 10));
      result.push(0, 0, 0, 0, 0, 0); // TODO: clan info 
      result.push(4, 0);
    }

    result[5] = userCount % 0xFF >>> 0;
    result[6] = userCount >>> 8;

    socket.send(result);
  } else {
    console.error('HANDLE THIS REQUEST USER_INFO ' + subOpcode); 
    // TODO: do this
  }
}
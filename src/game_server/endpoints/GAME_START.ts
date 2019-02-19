import { IGameEndpoint } from "../endpoint";
import { IGameSocket } from "../game_socket";
import { Queue, short } from "../../core/utils/unit";
import { RegionUpdate } from "../region";


export const GAME_START: IGameEndpoint = async function (socket: IGameSocket, body: Queue, opcode: number) {
  let subOpCode = body.byte();

  if (socket.ingame) {
    return;
  }

  if (subOpCode == 1) {
    sendQuests(socket);
    sendNotices(socket);
    sendTime(socket);
    sendWeather(socket);
    sendMyInfo(socket);
    sendZoneAbility(socket);

    socket.send([
      opcode
    ]);
  } else if (subOpCode == 2) {
    RegionUpdate(socket); // put user in region
    socket.ingame = true;

    sendRegionPlayers(socket);
    sendBlinkStart(socket);
  }
}




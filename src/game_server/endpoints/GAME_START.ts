import type { IGameEndpoint } from "../endpoint";
import type { IGameSocket } from "../game_socket";
import { Queue, short } from "../../core/utils/unit";
import { RegionUpdate } from "../region";
import { SendQuests } from "../functions/sendQuests";
import { SendNotices } from "../functions/sendNotices";
import { SendTime } from "../functions/sendTime";
import { SendWeather } from "../functions/sendWeather";
import { SendMyInfo } from "../functions/sendMyInfo";
import { SendZoneAbility } from "../functions/sendZoneAbility";
import { SendRegionUserInMultiple } from "../functions/sendRegionInOut";
import { SendBlinkStart } from "../functions/sendBlink";

export const GAME_START: IGameEndpoint = async function (
  socket: IGameSocket,
  body: Queue,
  opcode: number
) {
  let subOpCode = body.byte();

  if (socket.ingame) {
    return;
  }

  if (subOpCode == 1) {
    SendQuests(socket);
    SendNotices(socket);
    SendTime(socket);
    SendWeather(socket);
    SendMyInfo(socket);
    SendZoneAbility(socket);

    socket.send([opcode]);
  } else if (subOpCode == 2) {
    RegionUpdate(socket); // put user in region
    socket.ingame = true;

    SendRegionUserInMultiple(socket);
    SendBlinkStart(socket);
  }
};

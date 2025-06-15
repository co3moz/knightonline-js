import type { IGameEndpoint } from "../endpoint.js";
import type { IGameSocket } from "../game_socket.js";
import { Queue, short } from "../../core/utils/unit.js";
import { RegionUpdate } from "../region.js";
import { SendQuests } from "../functions/sendQuests.js";
import { SendNotices } from "../functions/sendNotices.js";
import { SendTime } from "../functions/sendTime.js";
import { SendWeather } from "../functions/sendWeather.js";
import { SendMyInfo } from "../functions/sendMyInfo.js";
import { SendZoneAbility } from "../functions/sendZoneAbility.js";
import { SendRegionUserInMultiple } from "../functions/sendRegionInOut.js";
import { SendBlinkStart } from "../functions/sendBlink.js";

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

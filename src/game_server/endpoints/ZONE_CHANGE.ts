import { Queue } from "../../core/utils/unit.js";
import type { IGameEndpoint } from "../endpoint.js";
import type { IGameSocket } from "../game_socket.js";
import { SendRegionUserInMultiple } from "../functions/sendRegionInOut.js";
import { SendBlinkStart } from "../functions/sendBlink.js";

export const ZONE_CHANGE: IGameEndpoint = async function (
  socket: IGameSocket,
  body: Queue,
  opcode: number
) {
  let subOpcode = body.byte();

  if (subOpcode == ZoneChangeEnum.LOADING) {
    socket.send([opcode, ZoneChangeEnum.LOADED]);
  } else if (subOpcode == ZoneChangeEnum.LOADED) {
    SendRegionUserInMultiple(socket, true);
    SendBlinkStart(socket);
  }
};

export enum ZoneChangeEnum {
  LOADING = 1,
  LOADED = 2,
  TELEPORT = 3,
  MILITARY = 4,
}

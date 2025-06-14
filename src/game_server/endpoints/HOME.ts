import type { IGameEndpoint } from "../endpoint";
import type { IGameSocket } from "../game_socket";
import { Queue } from "../../core/utils/unit";
import { ZoneCode } from "../var/zone_codes";
import { SendWarp } from "../functions/sendWarp";

export const HOME: IGameEndpoint = async function (socket: IGameSocket, body: Queue, opcode: number) {
  let c = socket.character;
  let v = socket.variables;

  if (c.zone == ZoneCode.ZONE_CHAOS_DUNGEON || c.zone == ZoneCode.ZONE_JURAD_MOUNTAIN || c.zone == ZoneCode.ZONE_BORDER_DEFENSE_WAR) {
    return;
  }

  let now = Date.now();
  if (v.lastHome) {
    if (v.lastHome > now) return;
  }

  v.lastHome = now + 1000;

  
  // TODO: HOME add health controls etc..
  
  SendWarp(socket, c.zone);
}
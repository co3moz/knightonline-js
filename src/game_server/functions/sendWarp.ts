import type { IGameSocket } from "../game_socket.js";
import { ZoneCode } from "../var/zone_codes.js";
import { ZoneStartPosition } from "../var/zone_start_position.js";
import { short } from "../../core/utils/unit.js";
import { RegionUpdate } from "../region.js";
import { SendRegionUserOutForMe } from "./sendRegionInOut.js";

export function SendWarp(socket: IGameSocket, zone: ZoneCode): boolean {
  let pos = FindStartPositionOfZoneForUser(socket, zone);

  if (!pos) {
    return false;
  }

  socket.character.x = pos.x;
  socket.character.z = pos.z;
  socket.character.y = 0;

  if (socket.character.zone == zone) {
    socket.send([
      0x1e, // WARP
      ...short(pos.x * 10),
      ...short(pos.z * 10),
    ]);

    RegionUpdate(socket);
  } else {
    socket.send([
      0x27, // ZONE_CHANGE
      3, // ZONE_CHANGE_TELEPORT
      ...short(zone),
      ...short(pos.x * 10),
      ...short(pos.z * 10),
      0,
      0,
      0,
    ]);

    socket.character.zone = zone;

    RegionUpdate(socket, true);

    SendRegionUserOutForMe(socket);
  }

  return true;
}

export function FindStartPositionOfZoneForUser(
  socket: IGameSocket,
  zone: ZoneCode
) {
  let u = socket.user;

  let startPosition = ZoneStartPosition[zone];
  let x = 0;
  let z = 0;

  if (!startPosition) {
    return;
  }

  if (u.nation == 1) {
    x = startPosition["karus"][0];
    z = startPosition["karus"][1];
  } else {
    x = startPosition["elmorad"][0];
    z = startPosition["elmorad"][1];
  }

  x += (Math.random() - 0.5) * startPosition["range"][0];
  z += (Math.random() - 0.5) * startPosition["range"][1];

  return { x, z };
}

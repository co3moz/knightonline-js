import { IGameSocket } from "../game_socket";
import { ZoneCode } from "../var/zone_codes";
import { ZoneStartPosition } from "../var/zone_start_position";
import { short } from "../../core/utils/unit";
import { RegionUpdate } from "../region";
import { SendRegionUserOutForMe } from "./sendRegionInOut";

export function SetWarp(socket: IGameSocket, zone: ZoneCode): boolean {
  let pos = FindStartPositionOfZoneForUser(socket, zone);

  if (!pos) {
    return false;
  }

  if (socket.character.zone == zone) {
    socket.send([
      0x1E, // WARP
      ...short(pos.x * 10),
      ...short(pos.z * 10)
    ]);
  } else {
    socket.send([
      0x27, // ZONE_CHANGE
      3, // ZONE_CHANGE_TELEPORT
      ...short(zone),
      ...short(pos.x * 10),
      ...short(pos.z * 10),
      0, 0, 0
    ]);

    socket.character.zone = zone;
  }

  socket.character.x = pos.x;
  socket.character.z = pos.z;
  socket.character.y = 0;

  RegionUpdate(socket, true);

  SendRegionUserOutForMe(socket);
}

export function FindStartPositionOfZoneForUser(socket: IGameSocket, zone: ZoneCode) {
  let u = socket.user;

  let startPosition = ZoneStartPosition[zone];
  let x = 0;
  let z = 0;

  if (!startPosition) {
    return;
  }

  if (u.nation == 1) {
    x = startPosition['karus'][0];
    z = startPosition['karus'][1];
  } else {
    x = startPosition['elmorad'][0];
    z = startPosition['elmorad'][1];
  }

  x += (Math.random() - 0.5) * startPosition['range'][0];
  z += (Math.random() - 0.5) * startPosition['range'][1];

  return { x, z };
}
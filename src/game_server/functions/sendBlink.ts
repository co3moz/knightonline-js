import { IGameSocket } from "../game_socket";
import { ZoneCode } from "../var/zone_codes";
import { ZoneRules, ZoneFlags } from "../var/zone_rules";
import { SendStateChange, AbnormalStates } from "./sendStateChange";

export function SendBlinkStart(socket: IGameSocket) {
  let v = socket.variables;
  let c = socket.character;

  let zone = c.zone;

  if (zone == ZoneCode.ZONE_ARDREAM
    || zone == ZoneCode.ZONE_NEW_RONARK_EVENT
    || zone == ZoneCode.ZONE_RONARK_LAND
    || zone == ZoneCode.ZONE_UNDER_THE_CASTLE
    || zone == ZoneCode.ZONE_JURAD_MOUNTAIN
    || zone == ZoneCode.ZONE_CHAOS_DUNGEON
    || zone == ZoneCode.ZONE_BORDER_DEFENSE_WAR) {
    return;
  }

  if (ZoneRules[zone].flags & ZoneFlags.WAR_ZONE) return;

  if (v.expiryBlink) {
    clearTimeout(v.expiryBlink);
  }

  v.expiryBlink = setTimeout(() => {
    SendStateChange(socket, 3, AbnormalStates.NORMAL);

    delete v.expiryBlink;
  }, 10000);

  SendStateChange(socket, 3, AbnormalStates.BLINKING);
}
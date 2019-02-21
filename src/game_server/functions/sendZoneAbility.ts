import { IGameSocket } from "../game_socket";
import { short } from "../../core/utils/unit";
import { ZoneRules, ZoneFlags } from "../var/zone_rules";

export function SendZoneAbility(socket: IGameSocket): void {
  let zoneRule = ZoneRules[socket.character.zone];
  if (!zoneRule) return;

  socket.send([
    0x5E, 1, // ZONEABILITY
    +!!(zoneRule.flag & ZoneFlags.TRADE_OTHER_NATION),
    zoneRule.type,
    +!!(zoneRule.flag & ZoneFlags.TALK_OTHER_NATION),
    ...short(zoneRule.tariff) //TODO: dynamic tariff's for later
  ]);
}
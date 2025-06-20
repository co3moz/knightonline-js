import type { IGameSocket } from "../game_socket.js";
import { short } from "../../core/utils/unit.js";
import { ZoneRules, ZoneFlags } from "../var/zone_rules.js";

export function SendZoneAbility(socket: IGameSocket): void {
  let zoneRule = ZoneRules[socket.character.zone];
  if (!zoneRule) return;

  socket.send([
    0x5e,
    1, // ZONEABILITY
    +!!(zoneRule.flag & ZoneFlags.TRADE_OTHER_NATION),
    zoneRule.type,
    +!!(zoneRule.flag & ZoneFlags.TALK_OTHER_NATION),
    ...short(zoneRule.tariff), //TODO: dynamic tariff's for later
  ]);
}

import type { IGameSocket } from "../game_socket.js";
import { RegionSend } from "../region.js";
import { short } from "../../core/utils/unit.js";
import { SendNoahChange, GoldGainType } from "./sendNoahChange.js";

export function SendNoahEvent(socket: IGameSocket, noah: number) {
  if (noah <= 0) return false; // this is event, not the punishment

  let multiplier = NoahEventChance();

  if (!multiplier) return false;

  RegionSend(socket, [
    0x4a, // GOLD_CHANGE
    GoldGainType.Event, // Event
    ...short(740),
    0,
    0,
    0,
    0,
    0,
    0,
    ...short(multiplier),
    ...short(socket.session),
  ]);

  SendNoahChange(socket, multiplier * noah);

  return true;
}

/**
 * Calculates chance of noah event.
 *
 *    0     0.2 => 1000
 *  0.2     0.6 => 500
 *  0.6     1.4 => 100
 *  1.4     3.0 => 50
 *  3.0     6.2 => 10
 *  6.2    12.6 => 2
 * 12.6   100.0 => 0
 */
export function NoahEventChance() {
  let chance = Math.random() * 100;

  if (chance > 12.6) return 0; // no luck
  if (chance > 6.2) return 2;
  if (chance > 3.0) return 10;
  if (chance > 1.4) return 50;
  if (chance > 0.6) return 100;
  if (chance > 0.2) return 500;
  return 1000;
}

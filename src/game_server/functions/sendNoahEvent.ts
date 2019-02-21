import { IGameSocket } from "../game_socket";
import { RegionSend } from "../region";
import { short } from "../../core/utils/unit";
import { SendNoahChange } from "./sendNoahChange";

export function SendNoahEvent(socket: IGameSocket, noah: number) {
  if (noah <= 0) return false; // this is event, not the punishment

  let chance = Math.random();
  let multiplier = 1;

  if (chance > 0.2) return false; // no luck
  if (chance > 0.18) multiplier = 2;
  else if (chance > 0.14) multiplier = 10;
  else if (chance > 0.10) multiplier = 50;
  else if (chance > 0.06) multiplier = 100;
  else if (chance > 0.02) multiplier = 500;
  else multiplier = 1000;

  RegionSend(socket, [
    0x4A, // GOLD_CHANGE
    5, // Event
    ...short(740), 0, 0, 0, 0, 0, 0, ...short(multiplier), ...short(socket.session)
  ]);


  SendNoahChange(socket, multiplier * noah);

  return true;
}
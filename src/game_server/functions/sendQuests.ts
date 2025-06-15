import type { IGameSocket } from "../game_socket.js";
import { short } from "../../core/utils/unit.js";

export function SendQuests(socket: IGameSocket) {
  let quests = socket.character.quests;

  let result: number[] = [];

  for (let quest of quests) {
    result.push(...short(quest.id), quest.state);
  }

  socket.send([
    0x64, // QUEST
    1,
    ...short(quests.length),
    ...result,
  ]);
}

import { IGameSocket } from "../game_socket";
import { short } from "../../core/utils/unit";

export function SendQuests(socket: IGameSocket) {
  let quests = socket.character.quests;

  socket.send([
    0x64, // QUEST
    1,
    ...short(quests.length),
    ...[].concat(...quests.map(quest => [
      ...short(quest.id),
      quest.state
    ]))
  ]);
}
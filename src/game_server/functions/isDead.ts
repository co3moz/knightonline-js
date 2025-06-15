import type { IGameSocket } from "../game_socket.js";

export function isUserDead(socket: IGameSocket) {
  let c = socket.character;

  return c.hp == 0;
}

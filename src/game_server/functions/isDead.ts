import { IGameSocket } from "../game_socket";

export function isUserDead(socket: IGameSocket) {
  let c = socket.character;

  return c.hp == 0;
}
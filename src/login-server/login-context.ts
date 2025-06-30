import type { Queue } from "../core/utils/unit.js";
import type { IGameSocket } from "../game_server/game_socket.js";

export interface LoginContext {
  socket: IGameSocket;
  body: Queue;
}

export type LoginHandle = (
  this: LoginContext
) => Promise<number[] | void> | number[] | void;

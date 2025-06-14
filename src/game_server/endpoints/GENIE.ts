import { Queue, int, short } from "../../core/utils/unit";
import type { IGameEndpoint } from "../endpoint";
import type { IGameSocket } from "../game_socket";

export const GENIE: IGameEndpoint = async function (
  socket: IGameSocket,
  body: Queue,
  opcode: number
) {
  let subOpcode = body.byte();

  if (subOpcode == 1) {
    subOpcode = body.byte();

    let c = socket.character;
    if (subOpcode == 1) {
      // spiringPotion
    } else if (subOpcode == 2) {
      // load options
      let g = c.genieSettings || [];

      let result = [opcode, 1, 2];
      for (let i = 0; i < 100; i++) {
        result.push(g[i] || 0);
      }

      socket.send(result);
    } else if (subOpcode == 3) {
      // save options
      c.genieSettings = body.sub(100);
      c.markModified("genieSettings");
    } else if (subOpcode == 4) {
      // start
    } else if (subOpcode == 5) {
      // stop
    }
  } else if (subOpcode == 2) {
    // TODO: HANDLE ME
  }
};

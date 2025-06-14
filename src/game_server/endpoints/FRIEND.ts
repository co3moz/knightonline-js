import type { IGameEndpoint } from "../endpoint";
import type { IGameSocket } from "../game_socket";
import { Queue, short, string, byte_string } from "../../core/utils/unit";
import { CharacterMap } from "../shared";

export const FRIEND: IGameEndpoint = async function (
  socket: IGameSocket,
  body: Queue,
  opcode: number
) {
  let subOpcode = body.byte();
  let c = socket.character;
  let map = CharacterMap;

  switch (subOpcode) {
    case 1: // REQUEST FRIEND LIST
      return socket.send([
        opcode,
        2,
        ...short(c.friends.length),
        ...[].concat(
          ...c.friends.map((friend) => [
            ...string(friend),
            ...short(map[friend] ? map[friend].session : -1),
            map[friend] ? (map[friend].variables.inParty ? 3 : 1) : 0,
          ])
        ),
      ]);

    case 3: {
      // ADD FRIEND
      let newFriendName = body.string();
      let socket = map[newFriendName];
      if (
        !socket ||
        !socket.character ||
        socket.character.name != newFriendName
      ) {
        return socket.send([
          opcode,
          3,
          1,
          ...byte_string(newFriendName),
          0xff,
          0xff,
          0,
        ]);
      }

      c.friends.push(newFriendName);
      c.markModified("friends");

      return socket.send([
        opcode,
        3,
        0,
        ...byte_string(newFriendName),
        ...short(socket.session),
        socket.variables.inParty ? 3 : 1,
      ]);
    }
    case 4: {
      // REMOVE FRIEND
      let friendName = body.string();
      let index = c.friends.findIndex((friend) => friend == friendName);
      if (index == -1) {
        return socket.send([
          opcode,
          4,
          1,
          ...byte_string(friendName),
          0xff,
          0xff,
          0,
        ]);
      }

      c.friends.splice(index, 1);
      c.markModified("friends");

      return socket.send([
        opcode,
        4,
        0,
        ...byte_string(friendName),
        0xff,
        0xff,
        0,
      ]);
    }
  }
};

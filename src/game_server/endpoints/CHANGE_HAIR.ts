import type { IGameEndpoint } from "../endpoint.js";
import type { IGameSocket } from "../game_socket.js";
import { Queue } from "../../core/utils/unit.js";
import { Character } from "@/models";

export const CHANGE_HAIR: IGameEndpoint = async function (
  socket: IGameSocket,
  body: Queue,
  opcode: number
) {
  body.skip(1); // no idea why
  let charName = body.byte_string();
  let face = body.byte();
  let hair = body.uint();

  if (!socket.user || !socket.user.characters.find((x) => x == charName)) {
    return socket.send([opcode, 0]);
  }

  var result = 1;
  try {
    let character = await Character.findOne({ name: charName }).exec();
    character.hair = hair;
    character.face = face;
    await character.save();
  } catch (e) {
    console.error("error ocurred on change hair");
    console.error(e.stack);
    result = 0;
  }

  socket.send([opcode, result]);
};

import type { IGameEndpoint } from "../endpoint.js";
import type { IGameSocket } from "../game_socket.js";
import { Queue } from "../../core/utils/unit.js";
import { Character } from "../../core/database/models/index.js";

export const NEW_CHAR: IGameEndpoint = async function (
  socket: IGameSocket,
  body: Queue,
  opcode: number
) {
  let index = body.byte();
  let name = body.string();
  let race = body.byte();
  let klass = body.short();
  let face = body.byte();
  let hair = body.uint();
  let str = body.byte();
  let hp = body.byte();
  let dex = body.byte();
  let int = body.byte();
  let mp = body.byte();

  if (index > 3 || index < 0) {
    // invalid request
    return socket.send([
      opcode,
      1, // NO_MORE
    ]);
  }

  if (!/^[a-zA-Z0-9]{3,20}$/.test(name)) {
    return socket.send([
      opcode,
      5, // NEWCHAR_BAD_NAME
    ]);
  }

  if (!isKlassValid(klass) || str + hp + dex + int + mp > 300) {
    return socket.send([
      opcode,
      2, // NEWCHAR_INVALID_DETAILS
    ]);
  }

  if (socket.user.characters[index]) {
    // you have already created at this index dude
    return socket.send([
      opcode,
      2, // NEWCHAR_INVALID_DETAILS
    ]);
  }

  if (str < 50 || hp < 50 || dex < 50 || int < 50 || mp < 50) {
    return socket.send([
      opcode,
      11, // NEWCHAR_STAT_TOO_LOW
    ]);
  }

  if (
    (socket.user.nation == 1 && race > 10) ||
    (socket.user.nation == 2 && race < 10)
  ) {
    return socket.send([
      opcode,
      2, // NEWCHAR_INVALID_DETAILS
    ]);
  }

  let nameControl = await Character.findOne({
    name,
  }).exec();

  if (nameControl) {
    return socket.send([
      opcode,
      3, // NEWCHAR_EXISTS
    ]);
  }

  var error = false;
  try {
    let sklass = SimplifyKlass(klass);

    let character = new Character({
      name,
      race,
      klass,
      strKlass: sklass,
      hair,
      level: 1,
      face,
      statStr: str,
      statHp: hp,
      statDex: dex,
      statMp: mp,
      statInt: int,
      money: 10, // 10 noah start
      items: Array(75).fill(null),
    });

    await character.save();

    if (!socket.user.characters) {
      socket.user.characters = [];
    }

    socket.user.characters[index] = character.name;
    socket.user.markModified("characters");

    await socket.user.save();
  } catch (e) {
    error = true;
  }

  if (error) {
    return socket.send([
      opcode,
      4, // NEWCHAR_DB_ERROR
    ]);
  }

  socket.send([
    opcode,
    0, // NEWCHAR_SUCCESS
  ]);
};

function isKlassValid(klass: number) {
  if (klass >= 101 && klass <= 115) {
    return true;
  }

  if (klass >= 201 && klass <= 215) {
    return true;
  }

  return false;
}

export function SimplifyKlass(klass: number) {
  if (klass >= 100 && klass < 200) {
    klass -= 100;
  } else if (klass >= 200 && klass < 300) {
    klass -= 200;
  } else {
    return "unknown";
  }

  if (klass == 1 || klass == 5 || klass == 6) {
    return "warrior";
  }

  if (klass == 2 || klass == 7 || klass == 8) {
    return "rogue";
  }

  if (klass == 3 || klass == 9 || klass == 10) {
    return "mage";
  }

  if (klass == 4 || klass == 11 || klass == 12) {
    return "priest";
  }

  if (klass == 5 || klass == 13 || klass == 14) {
    return "kurian";
  }

  return "unknown";
}

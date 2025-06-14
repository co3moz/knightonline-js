import type { IGameEndpoint } from "../endpoint";
import type { IGameSocket } from "../game_socket";
import { Queue, int, short, string } from "../../core/utils/unit";
import { ItemSlot } from "../var/item_slot";
import { Character } from "../../core/database/models";

const CHARACTER_ITEM_SLOTS = [
  ItemSlot.HEAD,
  ItemSlot.BREAST,
  ItemSlot.SHOULDER,
  ItemSlot.RIGHTHAND,
  ItemSlot.LEFTHAND,
  ItemSlot.LEG,
  ItemSlot.GLOVE,
  ItemSlot.FOOT,
];

export const ALLCHAR_INFO_REQ: IGameEndpoint = async function (
  socket: IGameSocket,
  body: Queue,
  opcode: number
) {
  if (!socket.user.characters) {
    socket.user.characters = [];
  }

  var characters = [];

  for (var i = 0; i < 4; i++) {
    let characterName = socket.user.characters[i];

    let data = {
      name: "",
      hair: 0,
      klass: 0,
      race: 0,
      level: 0,
      face: 0,
      zone: 0,
      items: null,
    };

    if (characterName) {
      let character = await Character.findOne({
        name: characterName,
      })
        .select([
          "name",
          "race",
          "klass",
          "hair",
          "level",
          "face",
          "zone",
          "items",
        ])
        .exec();

      if (character) {
        data.name = character.name;
        data.hair = character.hair;
        data.klass = character.klass;
        data.race = character.race;
        data.level = character.level;
        data.face = character.face;
        data.zone = character.zone;

        data.items = [];

        for (let slot of CHARACTER_ITEM_SLOTS) {
          let item = character.items[slot];

          if (item) {
            data.items.push(...int(item.id), ...short(item.durability));
          } else {
            data.items.push(0, 0, 0, 0, 0, 0);
          }
        }
      }
    }

    if (!data.items) {
      data.items = Array(6 * 8).fill(0); // (uint + short) * 8 item
    }

    characters.push(data);
  }

  socket.send([
    opcode,
    1,
    1,
    ...[].concat(
      ...characters.map((character) => [
        ...string(character.name),
        character.race,
        ...short(character.klass),
        character.level,
        character.face,
        ...int(character.hair),
        character.zone,
        ...character.items,
      ])
    ),
  ]);
};

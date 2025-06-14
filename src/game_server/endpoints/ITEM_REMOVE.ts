import { Queue } from "../../core/utils/unit";
import type { IGameEndpoint } from "../endpoint";
import type { IGameSocket } from "../game_socket";
import { SendAbility } from "../functions/sendAbility";
import { SendWeightChange } from "../functions/sendWeightChange";

export const ITEM_REMOVE: IGameEndpoint = async function (
  socket: IGameSocket,
  body: Queue,
  opcode: number
) {
  let type = body.byte();
  let pos = body.byte();
  let itemID = body.int();

  try {
    if (pos < 0) throw 1;

    if (type == 0 || type == 2) {
      // item in inventory
      if (pos >= 28) throw 1; // inventory cannot have more than 28 items (pos starts with 0)

      pos += 14; // we store inventory 14-42 area in database
    } else if (type == 1) {
      // item in equiped area
      if (pos >= 14) throw 1; // you cant wear more than 14 items
    }

    let c = socket.character;
    let item = c.items[pos];

    if (!item) throw 1; // item doesnt exist
    if (item.id != itemID) throw 1; // item doesnt match with requested

    // TODO: more checks

    c.items[pos] = null; // good bye item

    if (!c.removedItems) {
      c.removedItems = [];
    }

    c.removedItems.unshift({
      id: item.id,
      amount: item.amount,
      durability: item.durability,
      serial: item.serial,
      removedAt: new Date(),
    });

    if (c.removedItems.length > 20) {
      c.removedItems.pop(); // remove old deleted ones
    }

    c.markModified("items");
    c.markModified("removedItems");

    SendAbility(socket, true);
    SendWeightChange(socket);

    socket.send([opcode, 1]);
  } catch (e) {
    socket.send([opcode, 0]);
  }
};

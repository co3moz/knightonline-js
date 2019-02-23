import { IGameEndpoint } from "../endpoint";
import { IGameSocket } from "../game_socket";
import { Queue, int, short, byte_string } from "../../core/utils/unit";
import { Mail } from '../../core/database/models';
import { ItemSlot } from "../var/item_slot";

const INVENTORY_START = ItemSlot.INVENTORY_START;
const INVENTORY_END = ItemSlot.INVENTORY_END;

export const SHOPPING_MALL: IGameEndpoint = async function (socket: IGameSocket, body: Queue, opcode: number) {
  let subOpcode = body.byte();
  if (!(subOpcode == 1 || subOpcode == 2 || subOpcode == 6)) return; // ignore

  if (subOpcode == 1) { // STORE_OPEN
    // TODO: do later
    return socket.send([
      opcode,
      subOpcode,
      1, // error code
      1 // free slot
    ]);
  }

  if (subOpcode == 2) { // STORE_CLOSE
    // TODO: check this later
    // idea is check for items in database then send inventory data

    let data: number[] = [];
    let items = socket.character.items;
    for (var i = INVENTORY_START; i < INVENTORY_END; i++) {
      let item = items[i];
      if (item) {
        data.push(
          ...int(item.id),
          ...short(item.durability),
          ...short(item.amount),
          item.flag,
          0, 0
        );
      } else {
        data.push(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
      }
    }

    return socket.send([
      opcode,
      subOpcode,
      ...data
    ]);
  }

  // STORE_LETTER
  let letterOperation = body.byte();

  if (letterOperation == 1) { // LETTER_UNREAD
    return socket.send([
      opcode,
      subOpcode,
      letterOperation,
      await Mail.countDocuments({
        character: socket.character.name,
        deleted: false
      }).exec() & 0xFF
    ]);
  } else if (letterOperation == 2 || letterOperation == 3) { // LETTER_LIST or HISTORY
    let mails = await Mail.find({
      character: socket.character.name,
      status: 1,
      deleted: letterOperation == 3
    }).sort([['createdAt', -1]]).limit(letterOperation == 3 ? 20 : 12).exec()

    return socket.send([
      opcode,
      subOpcode,
      letterOperation,
      1, mails.length,
      ...[].concat(...mails.map(mail => [
        ...int(mail.marker),
        mail.status,
        ...byte_string(mail.subject),
        ...byte_string(mail.sender),
        ...int(mail.createdAt.getFullYear() * 10000 + (mail.createdAt.getMonth() + 1) * 100 + mail.createdAt.getDate()),
        7 - (Date.now() - mail.createdAt.getTime()) / 1000 / 3600 / 24
      ]))
    ]);
  } else if (letterOperation == 5) { // LETTER_READ
    let marker = body.int();

    let mail = await Mail.findOne({
      character: socket.character.name,
      marker
    }).exec();

    if (!mail) {
      return socket.send([
        opcode,
        subOpcode,
        letterOperation,
        0
      ]);
    }

    mail.status = 2;
    await mail.save();

    return socket.send([
      opcode,
      subOpcode,
      letterOperation,
      1, ...int(marker), ...byte_string(mail.message)
    ]);
  } else if (letterOperation == 6) { // SEND
    // TODO: need to do letter send
  } else if (letterOperation == 4) { // GET ITEM
    // TODO: need to do letter get item
  } else if (letterOperation == 7) { // DELETE
    let count = body.byte();

    if (count > 5) {
      return socket.send([
        opcode,
        subOpcode,
        letterOperation,
        -3 & 0xFF
      ]);
    }
  }

  socket.send([
    opcode,
    subOpcode,
    0, 0, 0, 0 //unit.int(0)
  ]);
}
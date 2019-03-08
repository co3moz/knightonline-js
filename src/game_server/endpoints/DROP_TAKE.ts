import { IGameEndpoint } from "../endpoint";
import { IGameSocket } from "../game_socket";
import { Queue, int, short, byte_string } from "../../core/utils/unit";
import { GetDrop, RemoveDrop } from "../drop";
import { SendNoahChange } from "../functions/sendNoahChange";
import { SendNoahEvent } from "../functions/sendNoahEvent";
import { FindSlotForItem } from "../functions/findSlotForItem";
import { ItemSlot } from "../var/item_slot";
import { SendWeightChange } from "../functions/sendWeightChange";
import { AllSend } from "../region";
import { GenerateItem } from "../functions/generateItem";
import { GetItemDetail } from "../../core/database/models";

export const DROP_TAKE: IGameEndpoint = async function (socket: IGameSocket, body: Queue, opcode: number) {
  let dropIndex = body.int();
  let item = body.int();

  try {
    let drop = GetDrop(dropIndex);
    if (!drop) throw 1;

    let session = socket.session;
    if (!drop.owners || drop.owners.findIndex(owner => owner == session) == -1) throw 1;

    // TODO: Check drop distance controls  etc..

    let idx = drop.dropped.findIndex(x => x && x.item == item);
    if (idx == -1) throw 1; // probably already picked

    let dropItem = drop.dropped[idx];
    drop.dropped.splice(idx, 1); // take the item from drop

    if (dropItem.item == 900000000) { // Money drop
      SendNoahChange(socket, dropItem.amount, false); // no need to send noah change, we will send with drop_take packet

      socket.send([
        opcode, 1, // success
        ...int(dropIndex),
        0xFF, // item position in inventory (nowhere :D)
        ...int(dropItem.item),
        ...short(dropItem.amount),
        ...int(socket.character.money) // see, we sent the current money
      ]);

      SendNoahEvent(socket, dropItem.amount); // randomly showing 2x, 5x, 50x.. event
    } else {
      let c = socket.character;
      let v = socket.variables;
      let { maxWeight, itemWeight } = v;

      // this part of code has to be sync, we load items when npc dies. calculation all of this can work flawless 
      let itemDetail = GetItemDetail(dropItem.item);

      let newTotalWeight = itemWeight + (itemDetail.weight | 0) * dropItem.amount;
      if (newTotalWeight > maxWeight) {
        return socket.send([
          opcode,
          6 // Weight limit reached..
        ]);
      }

      let slot = FindSlotForItem(socket, itemDetail, dropItem.amount);
      if (slot < 0) throw 1;

      if (c.items[slot]) {
        c.items[slot].amount = Math.min(9999, c.items[slot].amount + dropItem.amount);
      } else {
        c.items[slot] = GenerateItem(itemDetail, dropItem.amount);
      }

      let outputItem = c.items[slot];

      socket.send([
        opcode, 1, // success
        ...int(dropIndex),
        slot - ItemSlot.INVENTORY_START, // item position in inventory (nowhere :D)
        ...int(outputItem.id),
        ...short(outputItem.amount),
        ...int(c.money) // see, we sent the current money
      ]);

      socket.variables.itemWeight = newTotalWeight;
      SendWeightChange(socket);

      if (itemDetail.itemType == 4 && itemDetail.id != 900144023) {
        AllSend(socket, [
          0x7D, // LOGOS SHOUT,
          2,
          4,
          ...byte_string(c.name),
          ...int(itemDetail.id)
        ]);
      }
    }

    if (drop.dropped.length == 0) {
      RemoveDrop(dropIndex);
    }

  } catch (e) {
    socket.send([
      opcode,
      0 // Loot Error
    ]);
  }
}

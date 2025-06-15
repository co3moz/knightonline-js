import type { IGameSocket } from "../game_socket.js";
import type { IItem } from "../../core/database/models/index.js";
import { ItemSlot } from "../var/item_slot.js";

const INVENTORY_START = ItemSlot.INVENTORY_START;
const INVENTORY_END = ItemSlot.INVENTORY_END;

export function FindSlotForItem(
  socket: IGameSocket,
  itemDetail: IItem,
  count = 1
) {
  if (!itemDetail) return -1;

  let c = socket.character;
  let items = c.items;
  if (itemDetail.countable) {
    // can item stack together like pots, buses, or quest stuff..
    let emptySlot = -1;

    for (let i = INVENTORY_START; i < INVENTORY_END; i++) {
      let at = items[i];
      if (!at && emptySlot < 0) emptySlot = i;
      else if (at && at.id == itemDetail.id && at.amount + count <= 9999)
        return i;
    }

    return emptySlot;
  } else {
    for (let i = INVENTORY_START; i < INVENTORY_END; i++) {
      if (!items[i]) return i;
    }

    return -1;
  }
}

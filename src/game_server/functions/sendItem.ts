import type { IGameSocket } from "../game_socket.js";
import { byte_string, int, short } from "../../core/utils/unit.js";
import { FindSlotForItem } from "./findSlotForItem.js";
import { GetItemDetail } from "../../core/database/models/item.js";
import { GenerateItem } from "./generateItem.js";
import { SendWeightChange } from "./sendWeightChange.js";
import { AllSend } from "../region.js";
import { CalculateUserAbilities } from "./sendAbility.js";
import { SendStackChange } from "./sendStackChange.js";
import { EQUIP_MAX } from "../endpoints/ITEM_MOVE.js";

export function SendItem(
  socket: IGameSocket,
  itemId: number,
  amount: number,
  sendPacket = true
) {
  const c = socket.character;
  let v = socket.variables;
  let { itemWeight } = v;
  const itemDetail = GetItemDetail(itemId);

  if (!itemDetail) {
    return "unknown-item";
  }

  const slot = FindSlotForItem(socket, itemDetail, amount);

  if (slot < 0) {
    return "no-space";
  }

  if (c.items[slot]) {
    c.items[slot].amount = Math.min(9999, c.items[slot].amount + amount);
  } else {
    c.items[slot] = GenerateItem(itemDetail, amount);
  }

  if (itemDetail.kind === 255) {
    c.items[slot].amount = itemDetail.durability ?? 0;
  }

  let newTotalWeight = itemWeight + (itemDetail.weight | 0) * amount;
  socket.variables.itemWeight = newTotalWeight;

  if (itemDetail.itemType == 4 && itemDetail.id != 900144023) {
    AllSend([
      0x7d, // LOGOS SHOUT,
      2,
      4,
      ...byte_string(c.name),
      ...int(itemDetail.id),
    ]);
  }

  if (sendPacket) {
    SendStackChange(
      socket,
      itemId,
      c.items[slot].amount,
      c.items[slot].durability,
      slot - EQUIP_MAX,
      true,
      0
    );
  } else {
    CalculateUserAbilities(socket);

    SendWeightChange(socket);
  }

  return "ok";
}

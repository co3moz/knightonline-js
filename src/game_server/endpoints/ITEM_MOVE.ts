import { Queue } from "../../core/utils/unit.js";
import type { IGameEndpoint } from "../endpoint.js";
import type { IGameSocket } from "../game_socket.js";
import { SendAbility } from "../functions/sendAbility.js";
import { SendWeightChange } from "../functions/sendWeightChange.js";
import { SendItemMove } from "../functions/sendItemMove.js";
import {
  type ICharacterItem,
  GetItemDetail,
} from "../../core/database/models/index.js";
import { SendLookChange } from "../functions/sendLookChange.js";

const EQUIP_MAX = 14;
const INVENTORY_MAX = 28;

export const ITEM_MOVE: IGameEndpoint = async function (
  socket: IGameSocket,
  body: Queue,
  opcode: number
) {
  let type = body.byte();

  if (type == 2) {
    // rearranging..
    return socket.send([opcode, 2, 0]);
  }

  type = body.byte();
  let itemID = body.int();
  let pos = body.byte();
  let dst = body.byte();

  let c = socket.character;

  try {
    if (pos < 0 || dst < 0) throw 1;

    if (type == ItemMoveType.INVENTORY_TO_INVENTORY) {
      if (dst >= INVENTORY_MAX) throw 1;
      if (pos >= INVENTORY_MAX) throw 1;

      let item = c.items[pos + 14];

      if (!item) throw 1;
      if (item.id != itemID) throw 1;

      let targetSpot = c.items[dst + 14];

      c.items[pos + 14] = targetSpot;
      c.items[dst + 14] = item;
    } else if (type == ItemMoveType.INVENTORY_TO_COSPRE) {
      if (dst >= 8) throw 1;
      if (pos >= INVENTORY_MAX) throw 1;

      let item = c.items[pos + 14];

      if (!item) throw 1;
      if (item.id != itemID) throw 1;

      if (!IsValidPosForItem(socket, item, dst)) throw 1;

      let targetSpot = c.items[dst + 42];
      if (dst == 5 || dst == 6) {
        // magic bag
        if (targetSpot || GetItemDetail(item.id).slot != 25) throw 1; // if there is already a bag or item is not bag
      }

      c.items[pos + 14] = targetSpot;
      c.items[dst + 42] = item;

      SendAbility(socket, false);
      SendLookChange(socket, dst, item);
    } else if (type == ItemMoveType.COSPRE_TO_INVENTORY) {
      if (dst >= INVENTORY_MAX) throw 1;
      if (pos >= 8) throw 1;

      let item = c.items[pos + 42];

      if (!item) throw 1;
      if (item.id != itemID) throw 1;

      let targetSpot = c.items[dst + 14];

      c.items[pos + 42] = targetSpot;
      c.items[dst + 14] = item;

      SendAbility(socket, false);
      SendLookChange(socket, pos, null);
    } else if (type == ItemMoveType.EQUIP_TO_INVENTORY) {
      if (dst >= INVENTORY_MAX) throw 1;
      if (pos >= 14) throw 1;

      let item = c.items[pos];

      if (!item) throw 1;
      if (item.id != itemID) throw 1;

      let targetSpot = c.items[dst + 14];

      c.items[pos] = targetSpot;
      c.items[dst + 14] = item;

      SendAbility(socket, false);
      SendLookChange(socket, pos, null);
    } else if (type == ItemMoveType.EQUIP_TO_EQUIP) {
      if (dst >= 14) throw 1;
      if (pos >= 14) throw 1;

      let item = c.items[pos];

      if (!item) throw 1;
      if (item.id != itemID) throw 1;

      if (!IsValidPosForItem(socket, item, dst)) throw 1;

      let targetSpot = c.items[dst];

      c.items[pos] = targetSpot;
      c.items[dst] = item;

      SendAbility(socket, false);
      SendLookChange(socket, dst, item);
      SendLookChange(socket, pos, targetSpot);
    } else if (type == ItemMoveType.INVENTORY_TO_EQUIP) {
      if (dst >= 14) throw 1;
      if (pos >= 28) throw 1;

      let item = c.items[pos + 14];

      if (!item) throw 1;
      if (item.id != itemID) throw 1;

      if (!IsValidPosForItem(socket, item, dst)) throw 1;

      let targetSpot = c.items[dst];
      let leftHand = c.items[8];
      let rightHand = c.items[6];

      let itemDetail = GetItemDetail(item.id);
      if (itemDetail.slot == 1 || (itemDetail.slot == 0 && dst == 6)) {
        if (leftHand) {
          if (GetItemDetail(leftHand.id).slot == 4) {
            // drop the left hand
            c.items[6] = item;
            c.items[pos + 14] = leftHand;
            c.items[8] = null;
          } else {
            c.items[pos + 14] = targetSpot;
            c.items[dst] = item;
          }
        } else {
          c.items[pos + 14] = targetSpot;
          c.items[dst] = item;
        }
      } else if (itemDetail.slot == 2 || (itemDetail.slot == 0 && dst == 8)) {
        if (rightHand) {
          if (GetItemDetail(rightHand.id).slot == 3) {
            c.items[8] = item;
            c.items[pos + 14] = rightHand;
            c.items[6] = null;
          } else {
            c.items[pos + 14] = targetSpot;
            c.items[dst] = item;
          }
        } else {
          c.items[pos + 14] = targetSpot;
          c.items[dst] = item;
        }
      } else if (itemDetail.slot == 3) {
        if (leftHand && rightHand) throw 1; // dont allow it
        else if (leftHand) {
          c.items[6] = item;
          c.items[pos + 14] = leftHand;
          c.items[8] = null;
        } else {
          c.items[pos + 14] = targetSpot;
          c.items[dst] = item;
        }
      } else if (itemDetail.slot == 4) {
        if (leftHand && rightHand) throw 1; // dont allow it
        else if (rightHand) {
          c.items[8] = item;
          c.items[pos + 14] = rightHand;
          c.items[6] = null;
        } else {
          c.items[pos + 14] = targetSpot;
          c.items[dst] = item;
        }
      } else {
        c.items[pos + 14] = targetSpot;
        c.items[dst] = item;
      }

      SendAbility(socket, false);
      SendLookChange(socket, dst, item);
    } else {
      throw 1;
    }

    SendItemMove(socket, 1);
    SendWeightChange(socket);
  } catch (e) {
    SendItemMove(socket, 0);
  }
};

export enum ItemMoveType {
  INVENTORY_TO_EQUIP = 1,
  EQUIP_TO_INVENTORY = 2,
  INVENTORY_TO_INVENTORY = 3,
  EQUIP_TO_EQUIP = 4,
  INVENTORY_TO_ZONE = 5,
  ZONE_TO_INVENTORY = 6,
  INVENTORY_TO_COSPRE = 7,
  COSPRE_TO_INVENTORY = 8,
  INVENTORY_TO_MBAG = 9,
  MBAG_TO_INVENTORY = 10,
  MBAG_TO_MBAG = 11,
}

function IsValidPosForItem(
  socket: IGameSocket,
  item: ICharacterItem,
  slot: number
) {
  let detail = GetItemDetail(item.id);
  if (!detail) return false;

  let oneHandedItem = false;
  switch (detail.slot) {
    case 0:
      if (slot != 6 && slot != 8) return false;
      oneHandedItem = true;
      break;
    case 1:
      if (slot != 6) return false;
      oneHandedItem = true;
      break;
    case 2:
      if (slot != 8) return false;
      oneHandedItem = true;
      break;
    case 3: // only right hand
      // let leftHand = socket.character.items[8];
      // if (slot != 6 || leftHand) {
      //   let rightHand = socket.character.items[6];
      //   socket.character.items[8] = rightHand;
      //   socket.character.items[6] = leftHand;
      // }
      break;
    case 4: // only left hand
      // let rightHand = socket.character.items[6];
      // if (slot != 8 || rightHand) {
      //   let leftHand = socket.character.items[8];
      //   socket.character.items[8] = rightHand;
      //   socket.character.items[6] = leftHand;
      // }
      break;
    case 5:
      if (slot != 4) return false;
      break;
    case 6:
      if (slot != 10) return false;
      break;
    case 7:
      if (slot != 1) return false;
      break;
    case 8:
      if (slot != 12) return false;
      break;
    case 9:
      if (slot != 13) return false;
      break;
    case 10:
      if (slot != 0 && slot != 2) return false;
      break;
    case 11:
      if (slot != 3) return false;
      break;
    case 12:
      if (slot != 9 && slot != 11) return false;
      break;
    case 13:
      if (slot != 5) return false;
      break;
    case 14:
      if (slot != 7) return false;
      break;
    case 100:
      if (slot != 2 && slot != 3) return false;
      break;
    case 105:
      if (slot != 4) return false;
      break;
    case 107:
      if (slot != 1) return false;
      break;
    case 110:
      if (slot != 0) return false;
      break;
    case 111:
      if (slot != 7) return false;
      break;
    case 25:
      if (slot != 5 && slot != 6) return false;
      break;
    case 20:
      if (slot != 20) return false;
      break;
    default:
      return false;
  }

  if (oneHandedItem) {
    let otherHand = socket.character.items[slot == 8 ? 6 : 8];

    if (otherHand) {
      let otherHandSlot = GetItemDetail(otherHand.id).slot;

      if (otherHandSlot == 3 || otherHandSlot == 4) {
        let rightHand = socket.character.items[6];
        let leftHand = socket.character.items[8];
        socket.character.items[8] = rightHand;
        socket.character.items[6] = leftHand;
      }
    }
  }

  return true;
}

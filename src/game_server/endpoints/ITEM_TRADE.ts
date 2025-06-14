import { Queue, int } from "../../core/utils/unit";
import type { IGameEndpoint } from "../endpoint";
import type { IGameSocket } from "../game_socket";
import { type INPCInstance, NPCType } from "../ai_system/declare";
import { NPCMap } from "../ai_system/uuid";
import { GetItemDetail, PrepareItems } from "../../core/database/models";
import { isUserDead } from "../functions/isDead";
import { GenerateItem } from "../functions/generateItem";
import { SendAbility } from "../functions/sendAbility";
import { SendWeightChange } from "../functions/sendWeightChange";

export const ITEM_TRADE: IGameEndpoint = async function (
  socket: IGameSocket,
  body: Queue,
  opcode: number
) {
  let type = body.byte();

  let group: number = 0;
  let npc: INPCInstance;
  let purchasedItemCount: number = 0;
  let c = socket.character;
  let v = socket.variables;

  try {
    if (isUserDead(socket)) {
      throw 1;
    }

    if (type == TradeType.Buy || type == TradeType.Sell) {
      group = body.int();
      let npcID = body.short();
      npc = NPCMap[npcID];

      if (!npc) throw 0;
      if (
        npc.npc.type != NPCType.NPC_MERCHANT &&
        npc.npc.type != NPCType.NPC_TINKER
      )
        throw 0;
      if (npc.npc.sellingGroup != group) throw 0;

      //TODO: Range check
    }

    purchasedItemCount = body.byte();

    let itemPocket: IItemPocket[] = [];
    for (let i = 0; i < purchasedItemCount; i++) {
      let id = body.int();
      let pos = body.byte();
      let count = body.short();

      if (type == TradeType.Buy) body.short();

      itemPocket.push({ id, pos, count });
    }

    if (itemPocket.length == 0) throw 1;

    if (type == TradeType.Buy) await LoadItemPocketDetail(itemPocket);

    let totalPrice = 0;
    let totalWeight = 0;

    // control time
    if (type == TradeType.Buy) {
      for (let item of itemPocket) {
        let detail = GetItemDetail(item.id);
        if (!detail) throw 0;
        if (detail.race == 20) throw 0;

        let selGroup = detail.sellingGroup | 0;
        if (selGroup != ((group / 1000) | 0)) throw 1; // security check
        if (selGroup == 0) throw 3;
        if (
          item.pos >= 28 ||
          item.pos < 0 ||
          item.count <= 0 ||
          item.count > 9999
        )
          throw 2;
        let slot = c.items[14 + item.pos];

        if (slot) {
          // inventory slot controls
          if (slot.id != item.id) throw 2;
          if (!GetItemDetail(slot.id).countable) throw 2;
          if (slot.amount + item.count > 9999) throw 4;
        }
        totalPrice += (detail.buyPrice | 0) * item.count;
        totalWeight += (detail.weight | 0) * item.count;
        //TODO: premium players have 1/8 discount
      }
    } else if (type == TradeType.Sell) {
      for (let item of itemPocket) {
        if (
          item.pos >= 28 ||
          item.pos < 0 ||
          item.count <= 0 ||
          item.count > 9999
        )
          throw 2;

        let slot = c.items[14 + item.pos];
        if (!slot) throw 2;
        let detail = GetItemDetail(slot.id);

        if (!detail) throw 0;
        if (detail.race == 20) throw 0;
        if (slot.id != item.id) throw 2;
        if (slot.flag) throw 2;
        if (slot.amount < item.count) throw 3;
        if (detail.sellPrice) {
          totalPrice += (detail.buyPrice | 0) * item.count;
        } else {
          totalPrice += (((detail.buyPrice | 0) * item.count) / 6) | 0;
        }
        //TODO: premium players have 1/8 more
      }
    }

    let npcSellingGroup = npc.npc.sellingGroup | 0;
    if (type == TradeType.Buy) {
      if (npcSellingGroup != 249_000) {
        // buy items with MONEY
        if (c.money < totalPrice) throw 3;
        if (v.itemWeight + totalWeight > v.maxWeight) throw 4;

        for (let item of itemPocket) {
          let slot = c.items[14 + item.pos];

          if (slot) {
            slot.amount += item.count;
          } else {
            c.items[14 + item.pos] = GenerateItem(
              GetItemDetail(item.id),
              item.count
            );
          }
        }

        c.money -= totalPrice;

        SendAbility(socket);
        SendWeightChange(socket);
        c.markModified("items");

        socket.send([
          opcode,
          1,
          ...int(c.money),
          ...int(totalPrice),
          (npcSellingGroup / 1000) | 0,
        ]);
      } else {
        // buy items with NP
        //TODO: Handle this later
      }
    } else if (type == TradeType.Sell) {
      if (npcSellingGroup != 249_000) {
        // sell items for MONEY
        if (c.money + totalPrice > 2_100_000_000) throw 3;
        for (let item of itemPocket) {
          let slot = c.items[14 + item.pos];

          slot.amount -= item.count;
          if (!slot.amount) {
            c.items[14 + item.pos] = null;
          }
        }

        c.money += totalPrice;

        SendAbility(socket);
        SendWeightChange(socket);
        c.markModified("items");

        socket.send([
          opcode,
          1,
          ...int(c.money),
          ...int(totalPrice),
          (npcSellingGroup / 1000) | 0,
        ]);
      } else {
        // sell items for NP
        //TODO: Handle this later
      }
    }
  } catch (e) {
    socket.send([opcode, 0, e | 0]);
  }
};

export enum TradeType {
  Buy = 1,
  Sell = 2,
}

async function LoadItemPocketDetail(itemPocket: IItemPocket[]): Promise<void> {
  await PrepareItems(itemPocket.map((x) => x.id));
}

interface IItemPocket {
  id: number; // itemId
  pos: number;
  count: number;
}

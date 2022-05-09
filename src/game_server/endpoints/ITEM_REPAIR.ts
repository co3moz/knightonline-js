import { Queue, int } from '../../core/utils/unit';
import { IGameEndpoint } from '../endpoint';
import { IGameSocket } from '../game_socket';
import { Item } from "../../core/database/models";
import { SendNoahChange } from '../functions/sendNoahChange';

const ITEM_MAX = 14;

export const ITEM_REPAIR: IGameEndpoint = async function (socket: IGameSocket, body: Queue, opcode: number) {

  const pos = body.byte();
  const slot = body.byte();
  const npc = body.short();
  const item = body.int();

  const itemData = await Item.findOne({ id: item });

  if (!itemData) {
    return socket.send([
      opcode,
      0,
      ...int(socket.character.money)
    ]);
  }

  const maxDurability = itemData.durability || 1;
  let itemOnInventory;

  if (pos === 1) {
    itemOnInventory = socket.character.items[slot];
  } else if (pos === 2) {
    itemOnInventory = socket.character.items[ITEM_MAX + slot];
  }

  if (!itemOnInventory) {
    return socket.send([
      opcode,
      0,
      ...int(socket.character.money)
    ]);
  }

  // TODO: calculate repair price
  const PRICE = 31;

  if (!SendNoahChange(socket, PRICE, false)) {
    return socket.send([
      opcode,
      0,
      ...int(socket.character.money)
    ]);
  }

  itemOnInventory.durability = maxDurability;

  socket.send([
    opcode,
    1,
    ...int(socket.character.money)
  ]);
}
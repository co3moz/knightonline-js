import { SetItem, type ISetItem } from "../core/database/models/index.js";
import type { IGameSocket } from "./game_socket.js";

export const UserMap: { [name: string]: IGameSocket } = {};
export const CharacterMap: { [name: string]: IGameSocket } = {};
export let SetItems: { [itemId: string]: ISetItem } = {};

export async function LoadSetItems() {
  let obj = {};
  let setItems = await SetItem.find({}).lean().select(["-id", "-_id"]).exec();

  for (let setItem of setItems) {
    obj[setItem.id] = setItem;
  }

  SetItems = obj;
}

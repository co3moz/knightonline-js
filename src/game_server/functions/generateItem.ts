import { ICharacterItem, IItem } from "../../core/database/models";

export function GenerateItem(detail: IItem, amount: number = 1, flag: number = 0): ICharacterItem {
  return {
    id: detail.id,
    durability: detail.durability,
    amount,
    serial: GenerateItemSerial(),
    flag: 0,
    detail
  }
}

let serial = 0;
export function GenerateItemSerial() {
  return Date.now().toString(16) + (++serial & 0xFFFFFF).toString(16).padStart(6, '0')
}
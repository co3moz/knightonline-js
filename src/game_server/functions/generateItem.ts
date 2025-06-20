import type {
  ICharacterItem,
  IItem,
} from "../../core/database/models/index.js";

export function GenerateItem(
  detail: IItem,
  amount: number = 1,
  flag: number = 0
): ICharacterItem {
  return {
    id: detail.id,
    durability: detail.durability,
    amount,
    serial: GenerateItemSerial(),
    flag,
  };
}

let serial = 0;
export function GenerateItemSerial() {
  return (
    Date.now().toString(16) +
    (++serial & 0xffffff).toString(16).padStart(6, "0")
  );
}

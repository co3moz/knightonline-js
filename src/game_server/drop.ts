import { IItem } from "../core/database/models";
import { WaitNextTick } from "../core/utils/general";

const drops: IDropDictionary = <IDropDictionary>{}
let dropIndex = 0;

export function CreateDrop(owners: number[], dropped) {
  let index = ++dropIndex;

  drops[index] = {
    timestamp: Date.now(),
    owners,
    dropped
  };

  return index;
}

export function GetDrop(dropIndex: number) {
  return drops[dropIndex];
}


export function RemoveDrop(dropIndex: number) {
  if (drops[dropIndex]) {
    delete drops[dropIndex];
  }
}


export async function ClearDropsTick() {
  let timeout = Date.now() - 10 * 60 * 1000; // 10 mins
  let ioSafe = 0;
  let cleared = 0;
  for (let did in drops) {
    if (++ioSafe > 50) {
      ioSafe = 0;
      await WaitNextTick();
    }

    let drop = drops[did];
    if (drop.timestamp < timeout) {
      cleared++;
      delete drops[did];
    }
  }

  if (cleared) {
    console.log('[TICK] %d drops cleared!', cleared);
  }
}

export interface IDrop {
  owners: number[] // sessions that can take
  timestamp: number // timestamp that item(s) dropped
  dropped: IDropItem[]
}

export interface IDropItem {
  item: number // item id
  amount: number // item count
}

export interface IDropDictionary {
  [dropIndex: number]: IDrop
}
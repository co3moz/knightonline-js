import { IItem } from "../core/database/models";

const drops: IDropDictionary = <IDropDictionary>{}
let dropIndex = 0;

export function CreateDrop(owners: number[], dropped, specs?: IItem[]) {
  let index = ++dropIndex;

  drops[index] = {
    timestamp: Date.now(),
    owners,
    specs,
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


export interface IDrop {
  owners: number[] // sessions that can take
  timestamp: number // timestamp that item(s) dropped
  specs: IItem[] // item details
  dropped: IDropItem[]
}

export interface IDropItem {
  item: number // item id
  amount: number // item count
}

export interface IDropDictionary {
  [dropIndex: number]: IDrop
}
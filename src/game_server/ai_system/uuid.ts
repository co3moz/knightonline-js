import { UniqueQueue } from "../../core/utils/unique_queue.js";
import type { INPCInstance } from "./declare.js";

export const NPCUUID = UniqueQueue.from(30000, 10000);

export const NPCMap: INPCMap = {};

export interface INPCMap {
  [uuid: number]: INPCInstance;
}

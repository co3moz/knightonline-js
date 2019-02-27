import { UniqueQueue } from "../../core/utils/unique_queue";
import { INPCInstance } from "./declare";

export const NPCUUID = UniqueQueue(20000, 10000);

export const NPCMap: INPCMap = {};

export interface INPCMap {
  [uuid: number]: INPCInstance
}
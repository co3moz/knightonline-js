import { short, int } from "../../core/utils/unit";
import { INPCInstance } from "../ai_system/declare";

export function BuildNPCDetail(npc: INPCInstance) {
  // if (npc.cache) {

  //   return npc.cache;
  // }

  let model = npc.npc;
  const result: number[] = [];

  result.push(...short(model.id));
  result.push(model.isMonster ? 1 : 2);
  result.push(...short(model.pid));
  result.push(...int(model.sellingGroup));
  result.push(model.type || 0);
  result.push(0, 0, 0, 0);
  result.push(...short(model.size));
  result.push(...int(model.weapon1));
  result.push(...int(model.weapon2));
  result.push((model.isMonster ? 0 : model.group) || 0);
  result.push(model.level || 1);
  result.push(...short(npc.x * 10));
  result.push(...short(npc.z * 10));
  result.push(0, 0);
  result.push(0, 0, 0, 0); // FIXME: isGameOpen thing
  result.push(0); // FIXME: special npc
  result.push(0, 0, 0, 0);
  result.push(...short(npc.direction));

  // npc.cache = result;
  return result;
}
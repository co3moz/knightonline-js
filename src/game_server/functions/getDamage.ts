import type { IGameSocket } from "../game_socket.js";
import type { INPCInstance } from "../ai_system/declare.js";

export function GetDamageNPC(
  socket: IGameSocket,
  npc: INPCInstance,
  skill?,
  preview?
) {
  if (!npc || npc.hp == 0) return -1;
  let model = npc.npc;

  let ac = model.ac || 0;
  let v = socket.variables;
  let ap = v.totalHit || 0;

  if (socket.character.gm && socket.variables.saitama) {
    return 30000;
  }

  if (skill) {
    // TODO: do here
  } else {
    if (GetHitRate(v.totalHitRate / (model.evadeRate || 1)) == "fail") {
      return 0; // lol unlucky shit
    }

    let damage = (ap * 200) / (ac + 240);
    damage = 0.85 * damage + 0.3 * damage * Math.random();

    // TODO: Magic damage thing
    return Math.max(0, Math.min(32000, damage | 0));
  }
}

export function GetHitRate(rate: number) {
  let rand = Math.random();

  if (rate >= 5) {
    if (rand < 0.35) return "great";
    if (rand < 0.75) return "success";
    if (rand < 0.98) return "normal";
  } else if (rate >= 3) {
    if (rand < 0.25) return "great";
    if (rand < 0.6) return "success";
    if (rand < 0.96) return "normal";
  } else if (rate >= 2) {
    if (rand < 0.2) return "great";
    if (rand < 0.5) return "success";
    if (rand < 0.94) return "normal";
  } else if (rate >= 1.25) {
    if (rand < 0.15) return "great";
    if (rand < 0.4) return "success";
    if (rand < 0.92) return "normal";
  } else if (rate >= 0.8) {
    if (rand < 0.1) return "great";
    if (rand < 0.3) return "success";
    if (rand < 0.9) return "normal";
  } else if (rate >= 0.5) {
    if (rand < 0.08) return "great";
    if (rand < 0.25) return "success";
    if (rand < 0.8) return "normal";
  } else if (rate >= 0.33) {
    if (rand < 0.06) return "great";
    if (rand < 0.2) return "success";
    if (rand < 0.7) return "normal";
  } else if (rate >= 0.2) {
    if (rand < 0.04) return "great";
    if (rand < 0.15) return "success";
    if (rand < 0.6) return "normal";
  } else {
    if (rand < 0.02) return "great";
    if (rand < 0.1) return "success";
    if (rand < 0.5) return "normal";
  }

  return "fail";
}

import { INPCInstance } from "../ai_system/declare";
import { NPCMap } from "../ai_system/uuid";
import { RegionUpdateNPC, RegionQueryUsersByNpc, RegionSendByNpc } from "../region";
import { SendRegionNpcIn } from "../functions/sendRegionInOut";
import { short } from "../../core/utils/unit";
import { WaitNextTick } from "../../core/utils/general";

export async function OnNPCTick() {  
  let now = Date.now();
  let ioSafe = 0;

  for (let uuid in NPCMap) {
    if (++ioSafe > 50) {
      ioSafe = 0;
      await WaitNextTick();
    }

    let instance: INPCInstance = NPCMap[uuid];

    let diff = now - instance.timestamp;

    if (instance.wait > diff) {
      continue;
    }

    instance.timestamp = now;

    let npc = instance.npc;
    let spawn = instance.spawn;
    if (instance.status == 'init') {

      instance.status = 'standing';
      instance.zone = spawn.zone;

      instance.x = random(spawn.leftX, spawn.rightX);
      instance.z = random(spawn.topZ, spawn.bottomZ);

      instance.direction = spawn.direction;
      instance.hp = npc.hp;
      instance.mp = npc.mp;
      instance.maxMp = npc.mp;
      instance.maxHp = npc.hp;
      instance.initialized = true;
      delete instance.damagedBy;

      instance.agressive = !(npc.actType == 1 || npc.actType == 2);

      RegionUpdateNPC(instance);
      for (let socket of RegionQueryUsersByNpc(instance)) {
        SendRegionNpcIn(socket, instance);
      }

      instance.wait = npc.standtime;
    } else if (instance.status == 'standing') {
      if (CanMove(instance)) {
        instance.tx = random(spawn.leftX, spawn.rightX);
        instance.tz = random(spawn.topZ, spawn.bottomZ);

        let distance = TargetPointDistance(instance);

        if (distance != 0) {
          instance.status = 'moving';
          instance.wait = npc.speed;
        }
      }

    } else if (instance.status == 'moving') {
      let distance = TargetPointDistance(instance);
      if (distance < npc.speed1) {
        instance.x = instance.tx;
        instance.z = instance.tz;

        instance.wait = npc.standtime;
        instance.status = 'standing';
      } else {
        let ds = npc.speed1 / distance;
        let dx = (instance.tx - instance.x) * ds;
        let dz = (instance.tz - instance.z) * ds;

        instance.x += dx;
        instance.z += dz;
      }

      RegionUpdateNPC(instance);
      NpcMove(instance);
    } else if (instance.status == 'dead') {
      instance.status = 'init';
      instance.wait = 0;
    }
  }
}


function CanMove(instance: INPCInstance) {
  let npc = instance.npc;
  if (!npc.actType) return false;
  if (npc.actType == 4) return false;

  return true;
}

function TargetPointDistance(i: INPCInstance) {
  let nx = (i.tx - i.x);
  let nz = (i.tz - i.z);
  return Math.sqrt(nx * nx + nz * nz);
}

function NpcMove(instance: INPCInstance) {
  // speed is ms we convert it unit/sec
  RegionSendByNpc(instance, [
    0x0B,
    1,
    ...short(instance.uuid),
    ...short(instance.x * 10),
    ...short(instance.z * 10),
    0, 0,
    ...short(instance.npc.speed / 100)
  ]);
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}
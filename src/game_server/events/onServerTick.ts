import { OnNPCTick } from "./onNPCTick";
import { ClearDropsTick } from "../drop";
import { TimeDifference } from "../../core/utils/general";

let tick = 0;
let runNPC = true;
let runDrops = true;

export function OnServerTick() {
  ++tick;

  let time = TimeDifference.begin();
  if (runNPC) {
    runNPC = false;
    OnNPCTick().then(() => {
      runNPC = true
      let diff = time.end();
      if (diff > 5) console.log('[BUSY] NPC tick took %dms', diff);
    });
  }

  if (tick % 60 == 0 && runDrops) {
    runDrops = false;
    ClearDropsTick().then(() => {
      runDrops = true;
      let diff = time.end();
      if (diff > 1) console.log('[BUSY] Drops clear tick took %dms', diff);
    });
  }
}

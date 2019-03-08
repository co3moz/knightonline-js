import { OnNPCTick } from "./onNPCTick";
import { ClearDropsTick } from "../drop";
import { TimeDifference, GarbageCollect } from "../../core/utils/general";

let tick = 0;

export function OnServerTick() {
  ++tick;

  let time = TimeDifference.begin();
  OnNPCTick().then(() => {
    let diff = time.end();
    if (diff > 30) console.log('[BUSY] NPC tick took %dms', diff);
  });

  if (tick % 480 == 240) { // every 2 minute
    ClearDropsTick().then(() => {
      let diff = time.end();
      if (diff > 10) console.log('[BUSY] Drops clear tick took %dms', diff);
      GarbageCollect();
    });
  }
}

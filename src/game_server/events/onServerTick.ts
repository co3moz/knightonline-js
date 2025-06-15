import { OnNPCTick } from "./onNPCTick.js";
import { ClearDropsTick } from "../drop.js";
import { TimeDifference, GarbageCollect } from "../../core/utils/general.js";
import { AverageTime } from "../../core/utils/average_time.js";

export let tick = 0;

export const avgNPC = AverageTime.instance(50);
export const avgGC = AverageTime.instance(50);
export const avgDrop = AverageTime.instance(50);

export function OnServerTick() {
  ++tick;

  let time = TimeDifference.begin();

  let gcDiff = 0;
  if (tick % 960 == 480) {
    // every 4 minute
    GarbageCollect();
    gcDiff = time.end();
    avgGC.push(gcDiff);

    if (gcDiff > 15)
      console.log(
        "[BUSY] Garbage collect took %dms (average %dms)",
        gcDiff,
        avgGC.avg()
      );
  }

  OnNPCTick().then(() => {
    let diff = time.end() - gcDiff;
    avgNPC.push(diff);

    if (diff > 30)
      console.log(
        "[BUSY] NPC tick took %dms (average %dms)",
        diff,
        avgNPC.avg()
      );
  });

  if (tick % 480 == 240) {
    // every 2 minute
    ClearDropsTick().then(() => {
      let diff = time.end() - gcDiff;
      avgDrop.push(diff);

      if (diff > 10)
        console.log(
          "[BUSY] Drops clear tick took %dms (average %dms)",
          diff,
          avgDrop.avg()
        );
    });
  }
}

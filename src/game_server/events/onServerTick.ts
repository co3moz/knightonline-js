import { OnNPCTick } from "./onNPCTick";

export function OnServerTick() {
  console.time('npctick');
  OnNPCTick().then(() => {
    console.timeEnd('npctick');
  });
}

import { rawLevelUp } from "../var/level_up";

export const INVALID_EXP = 10000000000;

export function GetLevelUp(level: number, rebirth: number = 0): number {
  if (level < 0 && level > 83) return INVALID_EXP;
  if (rebirth < 0 && rebirth > 10) return INVALID_EXP;

  return rawLevelUp[level + rebirth];
}
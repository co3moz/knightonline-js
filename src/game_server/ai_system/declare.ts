import { INpc, ISpawn } from "../../core/database/models";

export interface INPCInstance {
  npc: INpc
  spawn: ISpawn

  uuid: number
  zone: number
  x: number
  z: number
  direction: number
  hp: number
  mp: number
  maxHp: number
  maxMp: number

  damagedBy?: INPCDamageDirectory
  status?: 'alive' | 'dead'
}

export type Damage = number;
export interface INPCDamageDirectory {
  [session: number]: Damage
}
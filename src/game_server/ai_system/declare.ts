import { INpc, ISpawn } from "../../core/database/models";

export interface INPCInstance {
  npc: INpc
  spawn: ISpawn

  uuid: number
  zone: number
  x: number // current x
  z: number // current z
  tx: number // target x
  tz: number // target z
  direction: number
  hp: number
  mp: number
  maxHp: number
  maxMp: number

  damagedBy?: INPCDamageDirectory
  status: 'init' | 'standing' | 'moving' | 'attacking' | 'tracing' | 'fighting' | 'back' | 'dead'
  timestamp: number
  wait: number
  initialized: boolean
  agressive: boolean

  cache: number[]
}

export type Damage = number;
export interface INPCDamageDirectory {
  [session: number]: Damage
}
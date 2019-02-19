import { Schema, SchemaTypes, model, Document } from 'mongoose';

export interface ISpawn {
  actType: number
  amount: number
  bottomZ: number
  leftX: number
  maxx: number
  maxz: number
  minx: number
  minz: number
  respawnTime: number
  rightX: number
  specialType: number
  topZ: number
  trap: number
  zone: number
  direction: number

  spawnedBy: string
  points?: { x: number, z: number }[]
}

export interface IDrop {
  item: number
  rate: number
}

export interface INpc extends Document {
  id: number,
  name: string
  pid: number
  size: number
  weapon1: number
  weapon2: number
  group: number
  actType: number
  type: number
  family: number
  rank: number
  title: number
  sellingGroup: number
  level: number
  exp: number
  loyalty: number
  hp: number
  mp: number
  attack: number
  ac: number
  hitRate: number
  evadeRate: number
  damage: number
  attackDelay: number
  speed1: number
  speed2: number
  standtime: number
  magic1: number
  magic2: number
  magic3: number
  fireR: number
  coldR: number
  lightningR: number
  magicR: number
  diseaseR: number
  poisonR: number
  bulk: number
  attackRange: number
  searchRange: number
  tracingRange: number
  money: number
  directAttack: number
  magicAttack: number
  speed: number
  moneyType: number

  isMonster: boolean
  spawn: ISpawn[],
  drops: IDrop[]
}

export const NpcSchema = new Schema({
  id: { type: Number, index: true },
  name: { type: String },
  pid: { type: Number }, // pictureId
  size: { type: Number },
  weapon1: { type: Number },
  weapon2: { type: Number },
  group: { type: Number },
  actType: { type: Number },
  type: { type: Number },
  family: { type: Number },
  rank: { type: Number },
  title: { type: Number },
  sellingGroup: { type: Number },
  level: { type: Number },
  exp: { type: Number },
  loyalty: { type: Number },
  hp: { type: Number },
  mp: { type: Number },
  attack: { type: Number },
  ac: { type: Number },
  hitRate: { type: Number },
  evadeRate: { type: Number },
  damage: { type: Number },
  attackDelay: { type: Number },
  speed1: { type: Number },
  speed2: { type: Number },
  standtime: { type: Number },
  magic1: { type: Number },
  magic2: { type: Number },
  magic3: { type: Number },
  fireR: { type: Number },
  coldR: { type: Number },
  lightningR: { type: Number },
  magicR: { type: Number },
  diseaseR: { type: Number },
  poisonR: { type: Number },
  bulk: { type: Number },
  attackRange: { type: Number },
  searchRange: { type: Number },
  tracingRange: { type: Number },
  money: { type: Number },
  directAttack: { type: Number },
  magicAttack: { type: Number },
  speed: { type: Number },
  moneyType: { type: Number },

  isMonster: { type: Boolean },
  spawn: [{ type: SchemaTypes.Mixed }],
  drops: [{ item: Number, rate: Number }]
}, { timestamps: false });

export const Npc = model<INpc>('Npc', NpcSchema, 'npcs');
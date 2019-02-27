import { Schema, SchemaTypes, model, Document } from 'mongoose';

export interface ISpawn {
  actType?: number
  amount?: number
  bottomZ: number
  leftX: number
  maxx?: number
  maxz?: number
  minx?: number
  minz?: number
  respawnTime?: number
  rightX: number
  specialType?: number
  topZ: number
  trap?: number
  zone: number
  direction: number
  
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
  size: { type: Number, default: 0 },
  weapon1: { type: Number, default: 0 },
  weapon2: { type: Number, default: 0 },
  group: { type: Number, default: 0 },
  actType: { type: Number, default: 0 },
  type: { type: Number, default: 0 },
  family: { type: Number, default: 0 },
  rank: { type: Number, default: 0 },
  title: { type: Number, default: 0 },
  sellingGroup: { type: Number, default: 0 },
  level: { type: Number, default: 0 },
  exp: { type: Number, default: 0 },
  loyalty: { type: Number, default: 0 },
  hp: { type: Number, default: 0 },
  mp: { type: Number, default: 0 },
  attack: { type: Number, default: 0 },
  ac: { type: Number, default: 0 },
  hitRate: { type: Number, default: 0 },
  evadeRate: { type: Number, default: 0 },
  damage: { type: Number, default: 0 },
  attackDelay: { type: Number, default: 0 },
  speed1: { type: Number, default: 0 },
  speed2: { type: Number , default: 0},
  standtime: { type: Number, default: 0 },
  magic1: { type: Number, default: 0 },
  magic2: { type: Number, default: 0 },
  magic3: { type: Number, default: 0 },
  fireR: { type: Number, default: 0 },
  coldR: { type: Number, default: 0 },
  lightningR: { type: Number, default: 0 },
  magicR: { type: Number, default: 0 },
  diseaseR: { type: Number, default: 0 },
  poisonR: { type: Number, default: 0 },
  bulk: { type: Number, default: 0 },
  attackRange: { type: Number, default: 0 },
  searchRange: { type: Number, default: 0 },
  tracingRange: { type: Number, default: 0 },
  money: { type: Number, default: 0 },
  directAttack: { type: Number, default: 0 },
  magicAttack: { type: Number, default: 0 },
  speed: { type: Number, default: 0 },
  moneyType: { type: Number, default: 0 },

  isMonster: { type: Boolean },
  spawn: [{ type: SchemaTypes.Mixed }],
  drops: [{ item: Number, rate: Number }]
}, { timestamps: false });

export const Npc = model<INpc>('Npc', NpcSchema, 'npcs');
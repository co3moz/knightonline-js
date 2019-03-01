import { Schema, SchemaTypes, model, Document } from 'mongoose';

export interface IItem extends Document {
  id: number
  name: string
  kind: number
  slot: number
  race: number
  klass: number
  damage: number
  delay: number
  range: number
  weight: number
  durability: number
  buyPrice: number
  sellPrice: number
  defenceAbility: number
  countable: boolean
  isUnique: boolean
  effect1: number
  effect2: number
  reqLevel: number
  reqLevelMax: number
  reqRank: number
  reqTitle: number
  reqStr: number
  reqHp: number
  reqDex: number
  reqInt: number
  reqMp: number
  sellingGroup: number
  itemType: number
  hitRate: number
  evaRate: number
  daggerDefenceAbility: number
  swordDefenceAbility: number
  maceDefenceAbility: number
  axeDefenceAbility: number
  spearDefenceAbility: number
  bowDefenceAbility: number
  jamadarDefenceAbility: number
  fireDamage: number
  iceDamage: number
  lightningDamage: number
  poisonDamage: number
  hpDrain: number
  mpDamage: number
  mpDrain: number
  mirrorDamage: number
  dropRate: number
  strB: number
  hpB: number
  dexB: number
  intB: number
  mpB: number
  maxhpB: number
  maxmpB: number
  fireR: number
  coldR: number
  lightningR: number
  magicR: number
  poisonR: number
  curseR: number
  itemClass: number
  itemExt: number
  iconID: number
  extension: number
  upgradeNotice: boolean
  npBuyPrice: number
  bound: boolean
}

export const ItemSchema = new Schema({
  id: { type: Number, index: true },
  name: { type: String },
  kind: { type: Number },
  slot: { type: Number },
  race: { type: Number },
  klass: { type: Number },
  damage: { type: Number },
  delay: { type: Number },
  range: { type: Number },
  weight: { type: Number },
  durability: { type: Number },
  buyPrice: { type: Number },
  sellPrice: { type: Number },
  defenceAbility: { type: Number },
  countable: { type: Boolean },
  isUnique: { type: Boolean },
  effect1: { type: Number },
  effect2: { type: Number },
  reqLevel: { type: Number },
  reqLevelMax: { type: Number },
  reqRank: { type: Number },
  reqTitle: { type: Number },
  reqStr: { type: Number },
  reqHp: { type: Number },
  reqDex: { type: Number },
  reqInt: { type: Number },
  reqMp: { type: Number },
  sellingGroup: { type: Number },
  itemType: { type: Number },
  hitRate: { type: Number },
  evaRate: { type: Number },
  daggerDefenceAbility: { type: Number },
  swordDefenceAbility: { type: Number },
  maceDefenceAbility: { type: Number },
  axeDefenceAbility: { type: Number },
  spearDefenceAbility: { type: Number },
  bowDefenceAbility: { type: Number },
  jamadarDefenceAbility: { type: Number },
  fireDamage: { type: Number },
  iceDamage: { type: Number },
  lightningDamage: { type: Number },
  poisonDamage: { type: Number },
  hpDrain: { type: Number },
  mpDamage: { type: Number },
  mpDrain: { type: Number },
  mirrorDamage: { type: Number },
  dropRate: { type: Number },
  strB: { type: Number },
  hpB: { type: Number },
  dexB: { type: Number },
  intB: { type: Number },
  mpB: { type: Number },
  maxhpB: { type: Number },
  maxmpB: { type: Number },
  fireR: { type: Number },
  coldR: { type: Number },
  lighingR: { type: Number },
  magicR: { type: Number },
  poisonR: { type: Number },
  curseR: { type: Number },
  itemClass: { type: Number },
  itemExt: { type: Number },
  iconID: { type: Number },
  extension: { type: Number },
  upgradeNotice: { type: Boolean },
  npBuyPrice: { type: Number },
  bound: { type: Boolean }
}, { timestamps: false });


export const Item = model<IItem>('Item', ItemSchema, 'items');
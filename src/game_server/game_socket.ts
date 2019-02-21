import { IKOSocket } from "../core/server";
import { ICharacter, IAccount, IWarehouse } from "../core/database/models";

export interface IGameSocket extends IKOSocket {
  character: ICharacter
  user: IAccount
  variables: IVariables
  warehouse: IWarehouse
  ingame: boolean

  visiblePlayers: IVisiblePlayers
  visibleNPCs: IVisibleNPCs
}

export interface IVisiblePlayers {
  [session: number]: boolean
}

export interface IVisibleNPCs {
  [uuid: number]: boolean
}

export interface IVariables {
  expiryBlink: NodeJS.Timeout // setTimeout id

  acAmount: number
  totalHit: number
  statBonus: number[]
  statBuffBonus: number[]
  APClassBonusAmount: number[]
  ACClassBonusAmount: number[]
  addWeaponDamage: number
  weaponsDisabled: boolean
  haveBow: boolean
  maxWeightAmount: number
  maxWeightBonus: number
  maxWeight: number
  APBonusAmount: number
  totalAc: number
  itemAc: number
  acPercent: number
  hitRateAmount: number
  avoidRateAmount: number
  totalHitRate: number
  totalEvasionRate: number
  itemHitRate: number
  itemEvasionRate: number
  resistanceBonus: number
  itemMaxHp: number
  itemMaxMp: number
  itemWeight: number
  fireR: number
  coldR: number
  lightningR: number
  magicR: number
  curseR: number
  poisonR: number
  daggerR: number
  swordR: number
  axeR: number
  maceR: number
  spearR: number
  bowR: number
  addArmourAc: number
  pctArmourAc: number
  itemExpGainAmount: number
  itemNoahGainAmount: number
  itemNPBonus: number
  equipedItemBonus: { [itemId: number]: { [type: number]: number } }
  maxMpAmount: number
  maxHp: number
  maxMp: number
  maxHpAmount: number
  hptype: number
  abnormalType: number
  inParty: boolean

  saitama: boolean // gm feature to hit 30k always
}
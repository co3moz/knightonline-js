import type { IKOSocket } from "../core/server.js";
import type {
  ICharacter,
  IAccount,
  IWarehouse,
} from "../core/database/models/index.js";
import type { HydratedDocument } from "mongoose";

export interface IGameSocket extends IKOSocket {
  character: HydratedDocument<ICharacter>;
  user: HydratedDocument<IAccount>;
  variables: IVariables;
  warehouse: HydratedDocument<IWarehouse>;
  ingame: boolean;

  visiblePlayers: IVisiblePlayers;
  visibleNPCs: IVisibleNPCs;

  target: number; // player's target
  targetType: "user" | "npc" | "notarget";
}

export interface IVisiblePlayers {
  [session: number]: boolean;
}

export interface IVisibleNPCs {
  [uuid: number]: boolean;
}

export interface IVariables {
  expiryBlink: NodeJS.Timeout; // setTimeout id

  acAmount: number;
  totalHit: number;
  statBonus: number[];
  statBuffBonus: number[];
  APClassBonusAmount: number[];
  ACClassBonusAmount: number[];
  addWeaponDamage: number;
  weaponsDisabled: boolean;
  haveBow: boolean;
  maxWeightAmount: number;
  maxWeightBonus: number;
  maxWeight: number;
  APBonusAmount: number;
  totalAc: number;
  itemAc: number;
  acPercent: number;
  hitRateAmount: number;
  avoidRateAmount: number;
  totalHitRate: number;
  totalEvasionRate: number;
  itemHitRate: number;
  itemEvasionRate: number;
  resistanceBonus: number;
  itemMaxHp: number;
  itemMaxMp: number;
  itemWeight: number;
  fireR: number;
  coldR: number;
  lightningR: number;
  magicR: number;
  curseR: number;
  poisonR: number;
  daggerR: number;
  swordR: number;
  axeR: number;
  maceR: number;
  spearR: number;
  bowR: number;
  addArmourAc: number;
  pctArmourAc: number;
  itemExpGainAmount: number;
  itemNoahGainAmount: number;
  itemNPBonus: number;
  equipedItemBonus: { [itemId: number]: { [type: number]: number } };
  maxMpAmount: number;
  maxHp: number;
  maxMp: number;
  maxHpAmount: number;
  hptype: number;
  abnormalType: number;
  inParty: boolean;

  isHelmetHiding: number;
  isCospreHiding: number;

  saitama: boolean; // gm feature to hit 30k always
  lastHome: number; // lastHomeTimestamp
  chatTo: string; // private message target user name
}

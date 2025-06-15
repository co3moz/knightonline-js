import { Schema, model, Document } from "mongoose";

export interface ISetItem extends Document {
  id: number;
  name: string;
  acBonus: number;
  hpBonus: number;
  mpBonus: number;
  statstrBonus: number;
  stathpBonus: number;
  statdexBonus: number;
  statintBonus: number;
  statmpBonus: number;
  flameResistance: number;
  glacierResistance: number;
  lightningResistance: number;
  poisonResistance: number;
  magicResistance: number;
  curseResistance: number;
  XPBonusPercent: number;
  coinBonusPercent: number;
  APBonusPercent: number;
  APBonusClassType: number;
  APBonusClassPercent: number;
  ACBonusClassType: number;
  ACBonusClassPercent: number;
  maxWeightBonus: number;
  NPBonus: number;
  unk10: number;
  unk11: number;
  unk12: number;
  unk13: number;
  unk14: number;
  unk15: number;
  unk16: number;
  unk17: number;
  unk18: number;
  unk19: number;
  unk20: number;
  unk21: number;
}

export const SetItemSchema = new Schema(
  {
    id: { type: Number, index: true },
    name: { type: String },
    acBonus: { type: Number },
    hpBonus: { type: Number },
    mpBonus: { type: Number },
    statstrBonus: { type: Number },
    stathpBonus: { type: Number },
    statdexBonus: { type: Number },
    statintBonus: { type: Number },
    statmpBonus: { type: Number },
    flameResistance: { type: Number },
    glacierResistance: { type: Number },
    lightningResistance: { type: Number },
    poisonResistance: { type: Number },
    magicResistance: { type: Number },
    curseResistance: { type: Number },
    XPBonusPercent: { type: Number },
    coinBonusPercent: { type: Number },
    APBonusPercent: { type: Number },
    APBonusClassType: { type: Number },
    APBonusClassPercent: { type: Number },
    ACBonusClassType: { type: Number },
    ACBonusClassPercent: { type: Number },
    maxWeightBonus: { type: Number },
    NPBonus: { type: Number },
    unk10: { type: Number },
    unk11: { type: Number },
    unk12: { type: Number },
    unk13: { type: Number },
    unk14: { type: Number },
    unk15: { type: Number },
    unk16: { type: Number },
    unk17: { type: Number },
    unk18: { type: Number },
    unk19: { type: Number },
    unk20: { type: Number },
    unk21: { type: Number },
  },
  { timestamps: false }
);

export const SetItem = model<ISetItem>("SetItem", SetItemSchema, "set_items");

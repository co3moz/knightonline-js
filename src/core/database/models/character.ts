import { Schema, model, Document } from "mongoose";

export interface ICharacterRemovedItem {
  id: number;
  durability: number;
  amount: number;
  serial: string;
  removedAt: Date;
}

export interface ICharacterItem {
  id: number;
  durability: number;
  amount: number;
  serial: string;
  expire?: number;
  flag: number;
}

export interface IQuestItem {
  id: number;
  state: number;
}

export interface ICharacter extends Document {
  name: string;
  race: number;
  klass: number;
  strKlass: "unknown" | "warrior" | "rogue" | "mage" | "priest" | "kurian";
  hair: number;
  rank: number;
  title: number;
  level: number;
  rebirth: number;
  exp: number;
  loyalty: number;
  loyaltyMonthly: number;
  face: number;
  city: number;
  gm: boolean;

  clan: number;
  fame: number;

  hp: number;
  mp: number;
  sp: number;

  statStr: number;
  statHp: number;
  statDex: number;
  statMp: number;
  statInt: number;
  statRemaining: number;

  money: number;
  zone: number;

  x: number;
  y: number;
  z: number;
  direction: number;

  skills: Buffer;
  skillPointCat1: number;
  skillPointCat2: number;
  skillPointCat3: number;
  skillPointMaster: number;
  skillPointFree: number;

  items: ICharacterItem[];
  removedItems: ICharacterRemovedItem[];
  quests: IQuestItem[];
  friends: string[];
  skillBar: number[];
  genieSettings: Buffer;
}

export const CharacterSchema = new Schema(
  {
    name: { type: String, index: true },
    race: { type: Number },
    klass: { type: Number },
    strKlass: { type: String },
    hair: { type: Number },
    rank: { type: Number, default: 0 },
    title: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    rebirth: { type: Number, default: 0 },
    exp: { type: Number, default: 1 },
    loyalty: { type: Number, default: 101 },
    loyaltyMonthly: { type: Number, default: 0 },
    face: { type: Number },
    city: { type: Number, default: 0 },
    gm: { type: Boolean, default: false }, // char based gm

    clan: { type: Number, default: 0 },
    fame: { type: Number, default: 0 },

    hp: { type: Number, default: 100 },
    mp: { type: Number, default: 100 },
    sp: { type: Number, default: 100 },

    statStr: { type: Number },
    statHp: { type: Number },
    statDex: { type: Number },
    statMp: { type: Number },
    statInt: { type: Number },
    statRemaining: { type: Number, default: 0 },

    money: { type: Number, default: 0 },
    zone: { type: Number, default: 21 },

    x: { type: Number, default: 817 },
    y: { type: Number, default: 0 },
    z: { type: Number, default: 435 },
    direction: { type: Number, default: 0 },

    skills: { type: Buffer },
    skillPointCat1: { type: Number, default: 0 },
    skillPointCat2: { type: Number, default: 0 },
    skillPointCat3: { type: Number, default: 0 },
    skillPointMaster: { type: Number, default: 0 },
    skillPointFree: { type: Number, default: 0 },

    items: [
      {
        id: { type: Number },
        durability: { type: Number },
        amount: { type: Number },
        serial: { type: String },
        expire: { type: Number },
        flag: { type: Number },
      },
    ],
    removedItems: [
      {
        id: { type: Number },
        durability: { type: Number },
        amount: { type: Number },
        serial: { type: String },
        removedAt: { type: Date },
      },
    ],
    quests: [
      {
        id: { type: Number },
        state: { type: Number },
      },
    ],

    magic: [
      {
        id: { type: Number },
        expiry: { type: Date },
      },
    ],

    friends: [String],
    skillBar: [Number],
    genieSettings: Buffer,
  },
  { timestamps: true }
);

export const Character = model<ICharacter>(
  "Character",
  CharacterSchema,
  "characters"
);

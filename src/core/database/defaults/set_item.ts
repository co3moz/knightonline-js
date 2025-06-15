import { CSVLoader } from "../utils/csv_loader.js";
import { SetItem } from "@/models";

export async function SetItemDefaults() {
  await CSVLoader("set_items", SetItemTransferObjects, 1066, SetItem);
}

const SetItemTransferObjects = {
  SetIndex: "id",
  SetName: "name",
  ACBonus: "acBonus",
  HPBonus: "hpBonus",
  MPBonus: "mpBonus",
  StrengthBonus: "statstrBonus",
  StaminaBonus: "stathpBonus",
  DexterityBonus: "statdexBonus",
  IntelBonus: "statintBonus",
  CharismaBonus: "statmpBonus",
  FlameResistance: "flameResistance",
  GlacierResistance: "glacierResistance",
  LightningResistance: "lightningResistance",
  PoisonResistance: "poisonResistance",
  MagicResistance: "magicResistance",
  CurseResistance: "curseResistance",
  XPBonusPercent: "XPBonusPercent",
  CoinBonusPercent: "coinBonusPercent",
  APBonusPercent: "APBonusPercent",
  APBonusClassType: "APBonusClassType",
  APBonusClassPercent: "APBonusClassPercent",
  ACBonusClassType: "ACBonusClassType",
  ACBonusClassPercent: "ACBonusClassPercent",
  MaxWeightBonus: "maxWeightBonus",
  NPBonus: "NPBonus",
  Unk10: "unk10",
  Unk11: "unk11",
  Unk12: "unk12",
  Unk13: "unk13",
  Unk14: "unk14",
  Unk15: "unk15",
  Unk16: "unk16",
  Unk17: "unk17",
  Unk18: "unk18",
  Unk19: "unk19",
  Unk20: "unk20",
  Unk21: "unk21",
};

import type { IGameSocket, IVariables } from "../game_socket.js";
import { ZoneCode } from "../var/zone_codes.js";
import { Coefficient } from "../var/coefficient.js";
import { type ISetItem, GetItemDetail } from "@/models";
import { SetItems } from "../shared.js";
import { ItemSlot } from "../var/item_slot.js";
import { SendItemMove } from "./sendItemMove.js";

const ZONE_SNOW_BATTLE = ZoneCode.ZONE_SNOW_BATTLE;
const ZONE_CHAOS_DUNGEON = ZoneCode.ZONE_CHAOS_DUNGEON;
const LEFTHAND = ItemSlot.LEFTHAND;
const RIGHTHAND = ItemSlot.RIGHTHAND;
const ItemSlotHelmet = ItemSlot.ItemSlotHelmet;
const ItemSlotPauldron = ItemSlot.ItemSlotPauldron;
const ItemSlotPads = ItemSlot.ItemSlotPads;
const ItemSlotGloves = ItemSlot.ItemSlotGloves;
const ItemSlotBoots = ItemSlot.ItemSlotBoots;

export function SendAbility(socket: IGameSocket, sendChanges = false) {
  CalculateUserAbilities(socket);

  if (sendChanges) {
    SendItemMove(socket, 2);
  }
}

export function CalculateUserAbilities(socket: IGameSocket) {
  let c = socket.character;
  let v = socket.variables;

  let coefficient = Coefficient[c.klass];
  if (!coefficient) return;

  let itemDamage = 0;
  let hitCoefficient = 0;

  v.addWeaponDamage = v.addWeaponDamage || 0;
  v.acAmount = v.acAmount || 0;

  v.totalHit = 0;

  if (!v.statBuffBonus) {
    v.statBuffBonus = [0, 0, 0, 0, 0];
  }

  if (!v.weaponsDisabled) {
    let rightHandItem = c.items[RIGHTHAND];
    let leftHandItem = c.items[LEFTHAND];

    if (rightHandItem) {
      let rightHandItemDetail = GetItemDetail(rightHandItem.id);
      switch ((rightHandItemDetail.kind / 10) | 0) {
        case 1:
          hitCoefficient = coefficient.shortSword;
          break;
        case 2:
          hitCoefficient = coefficient.sword;
          break;
        case 3:
          hitCoefficient = coefficient.axe;
          break;
        case 4:
        case 18:
          hitCoefficient = coefficient.club;
          break;
        case 5:
        case 7:
        case 10:
          hitCoefficient = coefficient.bow;
          v.haveBow = true;
          break;
        case 11:
          hitCoefficient = coefficient.staff;
          break;
      }
      if (rightHandItem.durability == 0) {
        itemDamage +=
          ((rightHandItemDetail.damage | 0) + v.addWeaponDamage) / 2;
      } else {
        itemDamage += (rightHandItemDetail.damage | 0) + v.addWeaponDamage;
      }
    }

    if (leftHandItem) {
      let leftHandItemDetail = GetItemDetail(leftHandItem.id);
      switch ((leftHandItemDetail.kind / 10) | 0) {
        case 10:
          hitCoefficient = coefficient.bow;
          v.haveBow = true;

          if (leftHandItem.durability == 0) {
            itemDamage +=
              ((leftHandItemDetail.damage | 0) + v.addWeaponDamage) / 2;
          } else {
            itemDamage += (leftHandItemDetail.damage | 0) + v.addWeaponDamage;
          }
          break;
        default:
          if (leftHandItem.durability == 0) {
            itemDamage +=
              ((leftHandItemDetail.damage | 0) + v.addWeaponDamage) / 4;
          } else {
            itemDamage +=
              (leftHandItemDetail.damage | 0) + v.addWeaponDamage / 2;
          }
          break;
      }
    }
  }

  if (itemDamage < 3) {
    itemDamage = 3;
  }

  CalculateStatBonus(socket);

  let totalStr = c.statStr + v.statBonus[0] + v.statBuffBonus[0];
  let totalDex = c.statDex + v.statBonus[2] + v.statBuffBonus[2];

  let baseAP = 0;
  let additionalAP = 3;
  let apStat = 0;

  if (c.statStr > 150) baseAP = c.statStr - 150;

  if (c.statStr == 160) baseAP--;

  let maxWeightAmount = v.maxWeightAmount || 100;
  v.maxWeight =
    ((totalStr + c.level) * 50 + v.maxWeightBonus) *
    (maxWeightAmount <= 0 ? 1 : maxWeightAmount / 100);

  if (c.strKlass == "rogue") {
    apStat = totalDex;
  } else {
    apStat = totalStr;
    additionalAP += baseAP;
  }

  if (c.strKlass == "warrior" || c.strKlass == "priest") {
    v.totalHit =
      0.01 * itemDamage * (apStat + 40) +
      hitCoefficient * itemDamage * c.level * apStat;
  } else if (c.strKlass == "rogue") {
    v.totalHit =
      0.007 * itemDamage * (apStat + 40) +
      hitCoefficient * itemDamage * c.level * apStat;
  } else if (c.strKlass == "mage") {
    v.totalHit =
      0.005 * itemDamage * (apStat + 40) +
      hitCoefficient * itemDamage * c.level;
  }

  v.totalHit =
    (((v.totalHit + additionalAP) * (100 + v.APBonusAmount)) / 100) >>> 0;

  v.totalAc = (coefficient.ac * (c.level + v.itemAc)) >>> 0;

  let acPercent = v.acPercent || 100;
  v.totalAc = (v.totalAc * acPercent) / 100;

  let hitRateAmount = v.hitRateAmount || 100;
  let avoidRateAmount = v.avoidRateAmount || 100;

  v.totalHitRate =
    (((1 + coefficient.hitRate * c.level * totalDex) * v.itemHitRate) / 100) *
    (hitRateAmount / 100);
  v.totalEvasionRate =
    (((1 + coefficient.evasionRate * c.level * totalDex) * v.itemEvasionRate) /
      100) *
    (avoidRateAmount / 100);

  UpdateMaxHp(socket, 0);
  UpdateMaxMp(socket);

  v.resistanceBonus = 0;
  // TODO: resistance bonus calculate
}

export function CalculateStatBonus(socket: IGameSocket) {
  let c = socket.character;
  let v = socket.variables;

  v.itemMaxHp = v.itemMaxMp = v.itemAc = v.itemWeight = v.maxWeightBonus = 0;
  v.itemHitRate = v.itemEvasionRate = 100;

  v.fireR = v.coldR = v.lightningR = v.magicR = v.curseR = v.poisonR = 0;
  v.daggerR = v.swordR = v.axeR = v.maceR = v.spearR = v.bowR = 0;

  v.statBonus = [0, 0, 0, 0, 0];
  v.equipedItemBonus = {};

  v.APBonusAmount =
    v.itemExpGainAmount =
    v.itemNPBonus =
    v.itemNoahGainAmount =
      0;

  v.APClassBonusAmount = [0, 0, 0, 0];
  v.ACClassBonusAmount = [0, 0, 0, 0];

  var setItems = {};

  for (let i = 0; i < 75; i++) {
    let item = c.items[i];
    if (!item) continue;
    let itemDetail = GetItemDetail(item.id);
    if (!itemDetail) continue;

    if (i == 47 || i == 48) {
      // magic bags
      v.maxWeightBonus += itemDetail.durability;
    } else {
      v.itemWeight += (itemDetail.weight || 0) * (item.amount || 0);
    }

    if (
      (i >= 14 && i < 42) ||
      (v.weaponsDisabled &&
        (i == LEFTHAND || i == RIGHTHAND) &&
        !((itemDetail.kind / 10) >>> 0 == 6)) ||
      i >= 49
    )
      continue;

    let itemAc = itemDetail.defenceAbility || 0;

    if (item.durability == 0) {
      itemAc = (itemAc / 10) >>> 0;
    }

    v.itemMaxHp += itemDetail.maxhpB || 0;
    v.itemMaxMp += itemDetail.maxmpB || 0;

    v.itemAc += itemAc;

    v.statBonus[0] += itemDetail.strB || 0;
    v.statBonus[1] += itemDetail.hpB || 0;
    v.statBonus[2] += itemDetail.dexB || 0;
    v.statBonus[3] += itemDetail.intB || 0;
    v.statBonus[4] += itemDetail.mpB || 0;

    v.itemHitRate += itemDetail.hitRate || 0;
    v.itemEvasionRate += itemDetail.evaRate || 0;

    v.fireR += itemDetail.fireR || 0;
    v.coldR += itemDetail.coldR || 0;
    v.lightningR += itemDetail.lightningR || 0;
    v.magicR += itemDetail.magicR || 0;
    v.poisonR += itemDetail.poisonR || 0;
    v.curseR += itemDetail.curseR || 0;

    v.daggerR += itemDetail.daggerDefenceAbility || 0;
    v.swordR += itemDetail.swordDefenceAbility || 0;
    v.axeR += itemDetail.axeDefenceAbility || 0;
    v.maceR += itemDetail.maceDefenceAbility || 0;
    v.spearR += itemDetail.spearDefenceAbility || 0;
    v.bowR += itemDetail.bowDefenceAbility || 0;

    if (itemDetail.fireDamage) {
      if (!v.equipedItemBonus[i]) v.equipedItemBonus[i] = {};
      v.equipedItemBonus[i][0] = +itemDetail.fireDamage;
    }

    if (itemDetail.iceDamage) {
      if (!v.equipedItemBonus[i]) v.equipedItemBonus[i] = {};
      v.equipedItemBonus[i][1] = +itemDetail.iceDamage;
    }

    if (itemDetail.lightningDamage) {
      if (!v.equipedItemBonus[i]) v.equipedItemBonus[i] = {};
      v.equipedItemBonus[i][2] = +itemDetail.lightningDamage;
    }

    if (itemDetail.poisonDamage) {
      if (!v.equipedItemBonus[i]) v.equipedItemBonus[i] = {};
      v.equipedItemBonus[i][3] = +itemDetail.poisonDamage;
    }

    if (itemDetail.hpDrain) {
      if (!v.equipedItemBonus[i]) v.equipedItemBonus[i] = {};
      v.equipedItemBonus[i][4] = +itemDetail.hpDrain;
    }

    if (itemDetail.mpDamage) {
      if (!v.equipedItemBonus[i]) v.equipedItemBonus[i] = {};
      v.equipedItemBonus[i][5] = +itemDetail.mpDamage;
    }

    if (itemDetail.mpDrain) {
      if (!v.equipedItemBonus[i]) v.equipedItemBonus[i] = {};
      v.equipedItemBonus[i][6] = +itemDetail.mpDrain;
    }

    if (itemDetail.mirrorDamage) {
      if (!v.equipedItemBonus[i]) v.equipedItemBonus[i] = {};
      v.equipedItemBonus[i][7] = +itemDetail.mirrorDamage;
    }

    if (itemDetail.kind == 255) {
      // ITEM_KIND_COSPRE
      SetItemApply(SetItems[item.id], v);
    }

    if (itemDetail.race < 100) {
      continue;
    }

    if (!setItems[itemDetail.race]) {
      setItems[itemDetail.race] = itemDetail.race * 10000;
    }

    switch (itemDetail.slot) {
      case ItemSlotHelmet:
        setItems[itemDetail.race] += 2;
        break;
      case ItemSlotPauldron:
        setItems[itemDetail.race] += 16;
        break;
      case ItemSlotPads:
        setItems[itemDetail.race] += 512;
        break;
      case ItemSlotGloves:
        setItems[itemDetail.race] += 2048;
        break;
      case ItemSlotBoots:
        setItems[itemDetail.race] += 4096;
        break;
    }
  }

  for (let item in setItems) {
    SetItemApply(SetItems[setItems[item]], v);
  }

  let addArmourAc = v.addArmourAc || 0;
  if (addArmourAc > 0) {
    v.itemAc += addArmourAc;
  } else {
    v.itemAc = v.itemAc * ((v.pctArmourAc || 100) / 100);
  }
}

export function SetItemApply(setItem: ISetItem, v: IVariables) {
  if (!setItem) return;

  v.itemAc += setItem.acBonus || 0;
  v.itemMaxHp += setItem.hpBonus || 0;
  v.itemMaxMp += setItem.mpBonus || 0;

  v.statBonus[0] += setItem.statstrBonus || 0;
  v.statBonus[1] += setItem.stathpBonus || 0;
  v.statBonus[2] += setItem.statdexBonus || 0;
  v.statBonus[3] += setItem.statintBonus || 0;
  v.statBonus[4] += setItem.statmpBonus || 0;

  v.fireR += setItem.flameResistance || 0;
  v.coldR += setItem.glacierResistance || 0;
  v.lightningR += setItem.lightningResistance || 0;
  v.magicR += setItem.magicResistance || 0;
  v.poisonR += setItem.poisonResistance || 0;
  v.curseR += setItem.curseResistance || 0;

  v.itemExpGainAmount += setItem.XPBonusPercent || 0;
  v.itemNoahGainAmount += setItem.coinBonusPercent || 0;
  v.itemNPBonus += setItem.NPBonus || 0;

  v.maxWeightBonus += setItem.maxWeightBonus || 0;
  v.APBonusAmount += setItem.APBonusPercent || 0;

  let APBonusClassType = setItem.APBonusClassType || 0;
  let ACBonusClassType = setItem.ACBonusClassType || 0;

  if (APBonusClassType >= 1 && APBonusClassType <= 4)
    v.APBonusAmount[APBonusClassType - 1] += setItem.APBonusClassPercent || 0;

  if (ACBonusClassType >= 1 && ACBonusClassType <= 4)
    v.ACClassBonusAmount[ACBonusClassType - 1] +=
      setItem.ACBonusClassPercent || 0;
}

export function UpdateMaxHp(socket: IGameSocket, flag: number) {
  let c = socket.character;
  let v = socket.variables;

  let coefficient = Coefficient[c.klass];
  if (!coefficient) return;

  let maxHpAmount = v.maxHpAmount || 0;
  let totalHpStat = c.statHp + v.statBonus[1] + v.statBuffBonus[1];

  if (c.zone == ZONE_SNOW_BATTLE && flag == 0)
    if (c.fame == 100 || c.rank == 1)
      // COMMANDER or KING
      v.maxHp = 300;
    else v.maxHp = 100;
  else if (c.zone == ZONE_CHAOS_DUNGEON && flag == 0) v.maxHp = 10000 / 10;
  else {
    v.maxHp =
      (coefficient.hp * c.level * c.level * totalHpStat +
        0.1 * (c.level * totalHpStat) +
        totalHpStat / 5 +
        maxHpAmount +
        v.itemMaxHp +
        20) |
      0;

    if (v.maxHp > 14000) v.maxHp = 14000;

    if (flag == 1) c.hp = v.maxHp;
    else if (flag == 2) v.maxHp = 100;
  }

  if (v.maxHp < c.hp) {
    c.hp = v.maxHp;
    // TODO: implement here
    // HpChange(m_sHp);
  }
}

export function UpdateMaxMp(socket: IGameSocket) {
  let c = socket.character;
  let v = socket.variables;

  let coefficient = Coefficient[c.klass];

  if (!coefficient) return;

  let maxMpAmount = v.maxMpAmount || 0;
  let totalInt = c.statInt + v.statBonus[3] + v.statBuffBonus[3];
  let totalMp = c.statMp + v.statBonus[4] + v.statBuffBonus[4];

  if (coefficient.mp != 0) {
    v.maxMp =
      (coefficient.mp * c.level * c.level * totalInt +
        0.1 * c.level * 2 * totalInt +
        totalInt / 5 +
        maxMpAmount +
        v.itemMaxMp +
        20) >>>
      0;
  } else if (coefficient.sp != 0) {
    v.maxMp =
      (coefficient.sp * c.level * c.level * totalMp +
        0.1 * c.level * 2 * totalMp +
        totalMp / 5 +
        maxMpAmount +
        v.itemMaxMp) >>>
      0;
  }

  if (v.maxMp < c.mp) {
    c.mp = v.maxMp;
    // TODO: implement here
    // MSpChange(m_sMp);
  }
}

export enum WeaponKind {
  DAGGER = 1,
  SWORD = 2,
  AXE = 3,
  MACE = 4,
  SPEAR = 5,
  SHIELD = 6,
  BOW = 7,
  LONGBOW = 8,
  LAUNCHER = 10,
  STAFF = 11,
  ARROW = 12,
  JAVELIN = 13,
  JAMADAR = 14,
  MACE2 = 18,
  WORRIOR_AC = 21,
  LOG_AC = 22,
  SWORD_2H = 22,
  WIZARD_AC = 23,
  PRIEST_AC = 24,
  AXE_2H = 32,
  MACE_2H = 42,
  SPEAR_2H = 52,
  PICKAXE = 61,
  FISHING = 63,
}

import { IGameSocket } from "../game_socket";
import { ItemSlot } from "../var/item_slot";
import { int, short, byte_string, long } from "../../core/utils/unit";
import { GetLevelUp } from "./getLevelUp";

export function SendMyInfo(socket: IGameSocket) {
  let u = socket.user;
  let c = socket.character;
  let v = socket.variables;

  let nation = u.nation;

  let items = [];

  for (let i = 0; i < 75; i++) {
    let item = c.items[i];

    if (i == ItemSlot.BAG2) {
      item = c.items[ItemSlot.FAIRY];
    } else if (i == ItemSlot.FAIRY) {
      item = c.items[ItemSlot.BAG2];
    }

    if (item) {
      items.push(
        ...int(item.id),
        ...short(item.durability),
        ...short(item.amount),
        item.flag,
        0, 0, // rental time,
        0, 0, 0, 0, // TODO: seal serial data
        0, 0, 0, 0 // unix expiration time
      );
    } else {
      items.push(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    }
  }


  socket.send([
    0x0E, // MYINFO
    ...short(socket.session & 0xFFFF),
    ...byte_string(c.name),
    ...short(c.x * 10),
    ...short(c.z * 10),
    ...short(c.y * 10),
    nation,
    c.race,
    ...short(c.klass),
    c.face,
    ...int(c.hair),
    c.rank,
    c.title,
    1, 1,
    c.level,
    ...short(c.statRemaining),
    ...long(GetLevelUp(c.level)),// maxExp
    ...long(c.exp),// exp
    ...int(c.loyalty),
    ...int(c.loyaltyMonthly),
    ...short(c.clan),
    c.fame,
    0, 0, 0, 0, 0, 0, 0, 0, 0xFF, 0xFF, 0, 0, 0, 0, // TODO: clan details
    2, 3, 4, 5, // unknown
    ...short(v.maxHp || 0), ...short(c.hp),
    ...short(v.maxMp || 0), ...short(c.mp),
    ...int(v.maxWeight), ...int(v.itemWeight),
    c.statStr, (v.statBonus[0] + v.statBuffBonus[0]),
    c.statHp, (v.statBonus[1] + v.statBuffBonus[1]),
    c.statDex, (v.statBonus[2] + v.statBuffBonus[2]),
    c.statInt, (v.statBonus[3] + v.statBuffBonus[3]),
    c.statMp, (v.statBonus[4] + v.statBuffBonus[4]),
    ...short(v.totalHit), ...short(v.totalAc),
    v.fireR, v.coldR, v.lightningR, v.magicR, v.curseR, v.poisonR,
    ...int(c.money),
    c.gm ? 0 : 1, // 0=GM 1=USER
    0xFF, 0xFF,
    0, 0, 0, 0, 0, 0, 0, 0, 0, // TODO: skill
    ...items,
    socket.user.premium ? 1 : 0,
    0, // TODO: premium type
    0, 0, // TODO: premium time,
    0, // chicken flag
    0, 0, 0, 0, // TODO: manner point
    0, 0, 0, 0, 0, 0, // military camp
    0, 0, // genie time
    c.rebirth,
    0, 0, 0, 0, 0, // rebirth stats
    0, 0, 0, 0, 0, 0, 0, 0, // unknown
    0, 0, // cover title
    0, 0, // skill title
    1, 0, 0, 0, // return symbol //FIX: LATER
    0, 0
  ]);
}

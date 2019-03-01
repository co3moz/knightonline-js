import { IGameSocket } from "../game_socket";
import { byte_string, short, int } from "../../core/utils/unit";
import { ItemSlot } from "../var/item_slot";

const UserDetailSlots = [ItemSlot.BREAST, ItemSlot.LEG, ItemSlot.HEAD, ItemSlot.GLOVE, ItemSlot.FOOT, ItemSlot.SHOULDER, ItemSlot.RIGHTHAND, ItemSlot.LEFTHAND, ItemSlot.CWING, ItemSlot.CHELMET, ItemSlot.CLEFT, ItemSlot.CRIGHT, ItemSlot.CTOP, ItemSlot.FAIRY, ItemSlot.FAIRY];

export function BuildUserDetail(socket: IGameSocket): number[] {
  const result: number[] = [];
  let uu = socket.user;
  let uc = socket.character;
  let uv = socket.variables;

  result.push(...byte_string(uc.name));
  result.push(...short(uu.nation));
  result.push(...short(-1)); // clan Id
  result.push(0); // fame
  result.push(0, 0, 0, 0, 0, 0, 0, 0xFF, 0xFF, 0, 0, 0, 0, 0, 0); // clan_details..
  result.push(uc.level);
  result.push(uc.race);
  result.push(...short(uc.klass));
  result.push(...short(uc.x * 10));
  result.push(...short(uc.z * 10));
  result.push(...short(uc.y * 10));
  result.push(uc.face);
  result.push(...int(uc.hair));
  result.push(uv.hptype || 1);
  result.push(...int(uv.abnormalType || 1));
  result.push(0); // need party
  result.push(uc.gm ? 0 : 1);
  result.push(0); // party leader?
  result.push(0); // invisibility state
  result.push(0); // teamcolor
  result.push(uv.isHelmetHiding || 0); // helmet hiding
  result.push(uv.isCospreHiding || 0); // cospre hiding
  result.push(...short(uc.direction));
  result.push(0); // chicken?
  result.push(uc.rank);
  result.push(0, 0);
  result.push(0xff, 0xff); // np rank

  for (let slot of UserDetailSlots) {
    let item = uc.items[slot];

    if (item) {
      result.push(...int(item.id), ...short(item.durability), item.flag);
    } else {
      result.push(0, 0, 0, 0, 0, 0, 0);
    }
  }

  result.push(uc.zone);
  result.push(0xFF, 0xFF, 0, 0, 0, 0, 0, 0, 0, 0/* genie */); //?
  result.push(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1); //?

  return result;
}
import type { IGameEndpoint } from "../endpoint.js";
import type { IGameSocket } from "../game_socket.js";
import { Queue } from "../../core/utils/unit.js";

export const KNIGHT: IGameEndpoint = async function (
  socket: IGameSocket,
  body: Queue,
  opcode: number
) {
  let subOpcode = body.byte();

  switch (subOpcode) {
    case KnightCodes.KNIGHTS_TOP10:
      // TODO: this is dummy, implement it later
      return socket.send([
        opcode,
        KnightCodes.KNIGHTS_TOP10,
        0,
        0,
        ...[].concat(
          ...Array(10)
            .fill(0)
            .map((x, i) => [0xff, 0xff, 0, 0, 0xff, 0xff, i > 4 ? i - 5 : i, 0])
        ),
      ]);
    default:
      //handle rest
      break;
  }
};

export enum KnightCodes {
  KNIGHTS_CREATE = 0x01, // clan creation
  KNIGHTS_JOIN = 0x02, // joining a clan
  KNIGHTS_WITHDRAW = 0x03, // leaving a clan
  KNIGHTS_REMOVE = 0x04, // removing a clan member
  KNIGHTS_DESTROY = 0x05, // disbanding a clan
  KNIGHTS_ADMIT = 0x06,
  KNIGHTS_REJECT = 0x07,
  KNIGHTS_PUNISH = 0x08,
  KNIGHTS_CHIEF = 0x09,
  KNIGHTS_VICECHIEF = 0x0a,
  KNIGHTS_OFFICER = 0x0b,
  KNIGHTS_ALLLIST_REQ = 0x0c,
  KNIGHTS_MEMBER_REQ = 0x0d,
  KNIGHTS_CURRENT_REQ = 0x0e,
  KNIGHTS_STASH = 0x0f,
  KNIGHTS_MODIFY_FAME = 0x10,
  KNIGHTS_JOIN_REQ = 0x11,
  KNIGHTS_LIST_REQ = 0x12,

  KNIGHTS_WAR_ANSWER = 0x14,
  KNIGHTS_WAR_SURRENDER = 0x15,

  KNIGHTS_MARK_VERSION_REQ = 0x19,
  KNIGHTS_MARK_REGISTER = 0x1a,
  KNIGHTS_CAPE_NPC = 0x1b,
  KNIGHTS_ALLY_CREATE = 0x1c,
  KNIGHTS_ALLY_REQ = 0x1d,
  KNIGHTS_ALLY_INSERT = 0x1e,
  KNIGHTS_ALLY_REMOVE = 0x1f,
  KNIGHTS_ALLY_PUNISH = 0x20,
  KNIGHTS_ALLY_LIST = 0x22,

  KNIGHTS_MARK_REQ = 0x23,
  KNIGHTS_UPDATE = 0x24,
  KNIGHTS_MARK_REGION_REQ = 0x25,

  KNIGHTS_UPDATE_GRADE = 0x30,
  KNIGHTS_POINT_REQ = 0x3b,
  KNIGHTS_POINT_METHOD = 0x3c,
  KNIGHTS_DONATE_POINTS = 0x3d,
  KNIGHTS_HANDOVER_VICECHIEF_LIST = 0x3e,
  KNIGHTS_HANDOVER_REQ = 0x3f,

  KNIGHTS_DONATION_LIST = 0x40,
  KNIGHTS_TOP10 = 0x41,
  KNIGHTS_HANDOVER = 0x4f,
}

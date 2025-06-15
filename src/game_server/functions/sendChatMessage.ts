import type { IGameSocket } from "../game_socket.js";
import { short, byte_string, string } from "../../core/utils/unit.js";
import { RegionSend } from "../region.js";

export function SendMessageToPlayer(
  socket: IGameSocket,
  type: ChatMessageType,
  sender: string,
  message: string,
  nation?: number,
  session?: number
) {
  if (!nation) nation = socket.user.nation;
  if (!session) session = socket.session;

  socket.send([
    0x10,
    type,
    nation,
    ...short(session),
    ...byte_string(sender),
    ...string(message, "ascii"),
  ]);
}

export function SendMessageToPlayerFromPlayer(
  socket: IGameSocket,
  fromSocket: IGameSocket,
  type: ChatMessageType,
  message: string
) {
  socket.send([
    0x10,
    type,
    fromSocket.user.nation,
    ...short(fromSocket.session),
    ...byte_string(fromSocket.character.name),
    ...string(message, "ascii"),
  ]);
}

export function SendPlayerMessageToRegion(
  socket: IGameSocket,
  message: string
) {
  let nation = socket.user.nation || 0;
  let type = socket.character.gm ? ChatMessageType.GM : ChatMessageType.GENERAL;

  RegionSend(socket, [
    0x10,
    type,
    nation,
    ...short(socket.session & 0xffff),
    ...byte_string(socket.character.name),
    ...string(message, "ascii"),
  ]);
}

export enum ChatMessageType {
  GENERAL = 1,
  PRIVATE = 2,
  PARTY = 3,
  FORCE = 4,
  SHOUT = 5,
  KNIGHTS = 6,
  PUBLIC = 7,
  WAR_SYSTEM = 8,
  PERMANENT = 9,
  END_PERMANENT = 10,
  MONUMENT_NOTICE = 11,
  GM = 12,
  COMMAND = 13,
  MERCHANT = 14,
  ALLIANCE = 15,
  ANNOUNCEMENT = 17,
  SEEKING_PARTY = 19,
  GM_INFO = 21, // info window : "Level: 0, UserCount:16649" (NOTE: Think this is the missing overhead info (probably in form of a command (with args))
  COMMAND_PM = 22, // Commander Chat PM??
  CLAN_NOTICE = 24,
  KROWAZ_NOTICE = 25,
  DEATH_NOTICE = 26,
  CHAOS_STONE_ENEMY_NOTICE = 27, // The enemy has destroyed the Chaos stone something (Red text, middle of screen)
  CHAOS_STONE_NOTICE = 28,
  ANNOUNCEMENT_WHITE = 29, // what's it used for?
  CHATROM = 33,
  NOAH_KNIGHTS = 34,
}

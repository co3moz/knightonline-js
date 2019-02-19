import { Queue } from "../core/utils/unit";
import { IGameSocket } from "./game_socket";
import * as Endpoints from './endpoints'

export enum GameEndpointCodes {
  VERSION_CHECK = 0x2B,
  LOGIN = 0x1,
  LOAD_GAME = 0x9F,
  SEL_NATION = 0x05,
  ALLCHAR_INFO_REQ = 0x0C,
  NEW_CHAR = 0x02,
  SEL_CHAR = 0x04,
  CHANGE_HAIR = 0x89, // client calls if hair = 0 
  SHOPPING_MALL = 0x6A,
  RENTAL = 0x73, // investigate this
  SPEEDHACK_CHECK = 0x41,
  HACK_TOOL = 0x72,
  SERVER_INDEX = 0x6B,
  GAME_START = 0x0D,
  KNIGHT = 0x3C,
  QUEST = 0x64,
  FRIEND = 0x49,
  SKILLDATA = 0x79,
  CHAT = 0x10,
  HOME = 0x48,
  MOVE = 0x06,
  ROTATE = 0x09,
  USER_INFO = 0x98,
  CHAT_TARGET = 0x35,
  REGION_PLAYER_DETAIL = 0x16,
  ZONE_CHANGE = 0x27,
  TARGET_HP = 0x22,
  STATE_CHANGE = 0x29,
  NPC_DETAILED_REQUEST = 0x1D,
  ATTACK = 0x08,
  DROP_OPEN = 0x24,
  DROP_TAKE = 0x26
}

export function GameEndpoint(name: string): IGameEndpoint {
  return Endpoints[name];
}

export interface IGameEndpoint {
  (socket: IGameSocket, body: Queue, opcode: number): Promise<void>
}
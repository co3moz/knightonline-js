import { Queue } from "../core/utils/unit.js";
import type { ILoginSocket } from "./login_socket.js";
import * as Endpoints from './endpoints/index.js'

export enum LoginEndpointCodes {
  VERSION_REQ = 0x01,
  DOWNLOADINFO_REQ = 0x02,
  CRYPTION = 0xF2,
  LOGIN_REQ = 0xF3,
  SERVERLIST = 0xF5,
  NEWS = 0xF6,
  CHECK_OTP = 0xFA,
  UNK_REQ = 0xFD
}

export function LoginEndpoint(name: string): ILoginEndpoint {
  return Endpoints[name];
}

export interface ILoginEndpoint {
  (socket: ILoginSocket, body: Queue, opcode: number): Promise<void>
}
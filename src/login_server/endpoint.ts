import { Queue } from "../core/utils/unit";
import { ILoginSocket } from "./login_socket";

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



export async function LoginEndpointResolver(name: string): Promise<ILoginEndpoint> {
  let cache = endpointCache[name];
  if (cache) return cache;
  return endpointCache[name] = <ILoginEndpoint>await import('./endpoints/' + name);
}

const endpointCache: LoginEndpointDirectory = {};

export interface ILoginEndpoint {
  (socket: ILoginSocket, body: Queue, opcode: number): Promise<void>
}

interface LoginEndpointDirectory {
  [endpoint: string]: ILoginEndpoint
}
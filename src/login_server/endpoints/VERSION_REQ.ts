import config from "config";
import { short, Queue } from "../../core/utils/unit.js";
import type { ILoginSocket } from "../login_socket.js";
import type { ILoginEndpoint } from "../endpoint.js";

let versions: any[] = config.get("loginServer.versions");
let { version: serverVersion } = versions[versions.length - 1];

export const VERSION_REQ: ILoginEndpoint = async function (
  socket: ILoginSocket,
  body: Queue,
  opcode: number
) {
  let clientVersion = body.short();

  socket.send([opcode, ...short(serverVersion)]);
};

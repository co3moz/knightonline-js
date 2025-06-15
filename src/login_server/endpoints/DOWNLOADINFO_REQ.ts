import config from "config";
import { Queue, string, configString, short } from "../../core/utils/unit.js";
import type { ILoginSocket } from "../login_socket.js";
import type { ILoginEndpoint } from "../endpoint.js";

let versions: any[] = config.get("loginServer.versions");

export const DOWNLOADINFO_REQ: ILoginEndpoint = async function (
  socket: ILoginSocket,
  body: Queue,
  opcode: number
) {
  let result = [];
  let totalFile = 0;
  let clientVersion = body.short();

  for (let version of versions) {
    if (version.version > clientVersion) {
      totalFile++;
      result.push(...string(version.fileName));
    }
  }

  socket.send([
    opcode,
    ...configString("loginServer.ftp.host"),
    ...configString("loginServer.ftp.dir"),
    ...short(totalFile),
    ...result,
  ]);
};

import { glob } from "glob";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, resolve } from "path";
import type { LoginContext, LoginHandle } from "./login-context.js";

export enum LoginEndpointCodes {
  VERSION_REQ = 0x01,
  DOWNLOADINFO_REQ = 0x02,
  CRYPTION = 0xf2,
  LOGIN_REQ = 0xf3,
  SERVERLIST = 0xf5,
  NEWS = 0xf6,
  CHECK_OTP = 0xfa,
  UNK_REQ = 0xfd,
}

const endpoints = {};

export function getLoginServerEndpoint(
  opcode: number
): LoginHandle | undefined {
  return endpoints[opcode];
}

export function addLoginServerEndpoint(opcode: number, handle: LoginHandle) {
  endpoints[opcode] = handle;

  console.log(
    `[LOGIN] addLoginServerEndpoint(opcode: ${
      LoginEndpointCodes[opcode]
    } 0x${opcode.toString(16).toUpperCase()})`
  );
}

export async function autoLoadLoginServerEndpoints() {
  const path = resolve(
    `${dirname(fileURLToPath(import.meta.url))}\\endpoints\\*.{ts,js}`
  ).replace(/\\/g, "/");
  const files = await glob(path);
  files.sort((a, b) => {
    return a.localeCompare(b);
  });

  for (const file of files) {
    await import(pathToFileURL(file).toString());
  }
}

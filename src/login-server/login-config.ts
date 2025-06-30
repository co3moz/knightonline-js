import config from "config";

const loginServer = config.get<{
  ip: string;
  ports: number[];
  ftp: {
    host: string;
    dir: string;
  };
  otp: string;
  maxOTPTry: number;
  versions: { version: number; fileName: string }[];
}>("loginServer");

export function getLoginServerIp() {
  return loginServer.ip;
}

export function getLoginServerFtp() {
  return loginServer.ftp;
}

export function getLoginServerPorts() {
  return loginServer.ports;
}

export function getLatestVersion() {
  let { version } = loginServer.versions[loginServer.versions.length - 1];

  return version;
}

export function getVersions() {
  return loginServer.versions;
}

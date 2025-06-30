import { short, string } from "../../core/utils/unit.js";
import { addLoginServerEndpoint, LoginEndpointCodes } from "../endpoint.js";
import {
  getLatestVersion,
  getLoginServerFtp,
  getVersions,
} from "../login-config.js";

const serverVersion = getLatestVersion();

addLoginServerEndpoint(LoginEndpointCodes.VERSION_REQ, function () {
  const clientVersion = this.body.short();

  return [LoginEndpointCodes.VERSION_REQ, ...short(serverVersion)];
});

addLoginServerEndpoint(LoginEndpointCodes.DOWNLOADINFO_REQ, function () {
  let result = [];
  let totalFile = 0;
  let clientVersion = this.body.short();

  for (let version of getVersions()) {
    if (version.version > clientVersion) {
      totalFile++;
      result.push(...string(version.fileName));
    }
  }

  const ftp = getLoginServerFtp();

  return [
    LoginEndpointCodes.DOWNLOADINFO_REQ,
    ...string(ftp.host),
    ...string(ftp.dir),
    ...short(totalFile),
    ...result,
  ];
});

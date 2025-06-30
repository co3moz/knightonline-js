import { addLoginServerEndpoint, LoginEndpointCodes } from "../endpoint.js";

addLoginServerEndpoint(LoginEndpointCodes.UNK_REQ, function () {
  return [LoginEndpointCodes.UNK_REQ, 0, 0];
});

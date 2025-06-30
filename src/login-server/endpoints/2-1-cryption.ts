import { addLoginServerEndpoint, LoginEndpointCodes } from "../endpoint.js";

addLoginServerEndpoint(LoginEndpointCodes.CRYPTION, function () {
  return [LoginEndpointCodes.CRYPTION, 0, 0, 0, 0, 0, 0, 0, 0];
});

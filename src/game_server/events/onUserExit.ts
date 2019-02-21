import { IGameSocket } from "../game_socket";
import { RSessionMap } from "../region";
import { SendRegionUserOut } from "../functions/sendRegionInOut";

export function OnUserExit(socket: IGameSocket) {
  let leaveSocket = socket.session;
  let visiblePlayers = socket.visiblePlayers;

  for (let session in visiblePlayers) {
    let userSocket = RSessionMap[session];

    if (userSocket) {
      SendRegionUserOut(userSocket, leaveSocket, true);
    }

    delete visiblePlayers[session];
  }


  if (socket.variables.expiryBlink) {
    clearTimeout(socket.variables.expiryBlink);
  }

  socket.character.save();
}
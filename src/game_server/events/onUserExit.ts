import { IGameSocket } from "../game_socket";
import { RSessionMap } from "../region";
import { SendRegionUserOut } from "../functions/sendRegionInOut";

export function OnUserExit(socket: IGameSocket, serverClose?: boolean) {
  if (!serverClose) {
    let leaveSocket = socket.session;
    let visiblePlayers = socket.visiblePlayers;

    if (visiblePlayers) {
      for (let session in visiblePlayers) {
        let userSocket = RSessionMap[session];

        if (userSocket) {
          SendRegionUserOut(userSocket, leaveSocket, true);
        }

        delete visiblePlayers[session];
      }
    }
  }


  if (socket.variables && socket.variables.expiryBlink) {
    clearTimeout(socket.variables.expiryBlink);
  }

  let actions: Promise<any>[] = [];

  if (socket.user) actions.push(socket.user.save({ validateBeforeSave: false, }));
  if (socket.character) actions.push(socket.character.save({ validateBeforeSave: false }));
  if (socket.warehouse) actions.push(socket.warehouse.save({ validateBeforeSave: false }));

  return Promise.all(actions);
}
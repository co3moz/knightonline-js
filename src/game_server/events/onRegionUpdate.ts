import { IGameSocket } from "../game_socket";
import { SendRegionUserOut, SendRegionNpcOut, SendRegionUserIn, SendRegionNpcIn, RegionInCase } from "../functions/sendRegionInOut";
import { BuildUserDetail } from "../functions/buildUserDetail";
import { RSessionMap, RegionQuery, RegionQueryNPC, RNPCMap, IRegionNPC } from "../region";

export function OnRegionUpdate(socket: IGameSocket) {
  if (!socket.ingame) return;
  let oldSessions: number[] = <any>Object.keys(socket.visiblePlayers);
  let oldNPCSessions: number[] = <any>Object.keys(socket.visiblePlayers);
  let newSessions: number[] = [];
  let newNPCSessions: number[] = [];

  for (let userSocket of RegionQuery(socket)) {
    newSessions.push(userSocket.session);
  }

  for (let npc of RegionQueryNPC(socket)) {
    newNPCSessions.push(npc.uuid);
  }

  for (let oldSession of oldSessions) {
    if (!newSessions.find(x => x == oldSession)) {
      SendRegionUserOut(socket, oldSession);
    }
  }

  for (let oldNpcSession of oldNPCSessions) {
    if (!newNPCSessions.find(x => x == oldNpcSession)) {
      SendRegionNpcOut(socket, oldNpcSession);
    }
  }

  let cache;

  for (let newSession of newSessions) {
    if (!oldSessions.find(x => x == newSession)) {
      let userSocket = RSessionMap[newSession];

      if (userSocket) {
        if (!cache) {
          cache = BuildUserDetail(socket);
        }

        SendRegionUserIn(userSocket, socket.session, RegionInCase.NORMAL, false, cache);
      }
    }
  }

  for (let newNPCSession of newNPCSessions) {
    if (!oldNPCSessions.find(x => x == newNPCSession)) {
      let npc: IRegionNPC = RNPCMap[newNPCSession];

      if (npc) {
        SendRegionNpcIn(socket, npc.npc);
      }
    }
  }
}
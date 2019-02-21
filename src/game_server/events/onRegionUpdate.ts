import { IGameSocket } from "../game_socket";
import { SendRegionUserOut, SendRegionNpcOut, SendRegionUserIn, SendRegionNpcIn, RegionInCase } from "../functions/sendRegionInOut";
import { BuildUserDetail } from "../functions/buildUserDetail";
import { RSessionMap, RegionQuery, RegionQueryNPC, RNPCMap } from "../region";
import { byte_string, string } from "../../core/utils/unit";

export function OnRegionUpdate(socket: IGameSocket) {
  if (!socket.ingame) return;
  let names = [];
  let oldSessions: number[] = <any>Object.keys(socket.visiblePlayers);
  let oldNPCSessions: number[] = <any>Object.keys(socket.visiblePlayers);
  let newSessions = [];
  let newNPCSessions = [];

  for (let userSocket of RegionQuery(socket)) {
    newSessions.push(userSocket.session);
    names.push(userSocket.character.name);
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
      let npc = RNPCMap[newNPCSession];

      if (npc) {
        SendRegionNpcIn(socket, npc.npc);
      }
    }
  }

  socket.send([
    0x10, 7, socket.user.nation,
    0xFF, 0xFF,
    ...byte_string('REGION'),
    ...string(` users: ${names.join(', ')}`, 'ascii')
  ]);
}
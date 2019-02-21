import { IGameSocket } from "../game_socket";
import { short } from "../../core/utils/unit";
import { RSessionMap, RegionQuery, RegionQueryNPC } from "../region";
import { BuildUserDetail } from "./buildUserDetail";
import { INPCInstance } from "../ai_system/declare";
import { BuildNPCDetail } from "./buildNPCDetail";


export function SendRegionUserOut(socket: IGameSocket, whichSessionOut: number, onlyOneWay?: boolean) {
  if (!socket) return;
  if (socket.session == whichSessionOut) return;

  if (socket.visiblePlayers[whichSessionOut]) {
    delete socket.visiblePlayers[whichSessionOut];

    socket.send([
      0x07,  // USER_IN_OUT
      2, 0, // hide
      ...short(whichSessionOut)
    ]);
  }

  if (!onlyOneWay) {
    SendRegionUserOut(RSessionMap[whichSessionOut], socket.session, true);
  }
}

export function SendRegionUserOutForMe(socket: IGameSocket) {
  if (!socket) return;

  const map = socket.visiblePlayers;
  const packet = [
    0x07,  // USER_IN_OUT
    2, 0, // hide
    ...short(socket.session)
  ];

  for (let session in map) {
    socket.send(packet);

    delete map[session];
  }
}

export function SendRegionUserIn(socket: IGameSocket, whichSessionIn: number, inCase: RegionInCase, onlyOneWay?: boolean, cached?: number[]) {
  if (!socket) return;
  if (socket.session == whichSessionIn) return;


  if (!socket.visiblePlayers[whichSessionIn]) {
    socket.visiblePlayers[whichSessionIn] = true;

    if (!cached) {
      let u = RSessionMap[whichSessionIn];
      if (u) {
        cached = BuildUserDetail(u);
      }
    }

    socket.send([
      0x07,  // USER_IN_OUT
      inCase, 0, // show
      ...short(whichSessionIn),
      ...cached
    ]);
  }

  if (!onlyOneWay) {
    SendRegionUserIn(RSessionMap[whichSessionIn], socket.session, RegionInCase.NORMAL, true);
  }
}

export function SendRegionUserInMultiple(socket: IGameSocket, warp?: boolean) {
  socket.send([0x15, 0]);

  SendRegionUserOutForMe(socket); // clears visiblePlayers

  let result = [0x15, 1, 0, 0];
  let userCount = 0;
  let userDetail = BuildUserDetail(socket);
  let warpCase = warp ? RegionInCase.WARP : RegionInCase.SPAWN;

  for (let userSocket of RegionQuery(socket)) {
    if (userSocket == socket) continue;
    userCount++;
    socket.visiblePlayers[userSocket.session] = true;
    result.push(...short(userSocket.session));

    SendRegionUserIn(userSocket, socket.session, warpCase, true, userDetail);
  }


  result[2] = userCount & 0xFF;
  result[3] = userCount >>> 8;

  socket.send(result);
  socket.send([0x15, 2]);


  result = [0x1C, 0, 0];
  let npcSessions = [];
  for (let npc of RegionQueryNPC(socket)) {
    npcSessions.push(npc.uuid);
    result.push(...short(npc.uuid));
  }

  result[1] = npcSessions.length & 0xFF;
  result[2] = npcSessions.length >>> 8;

  socket.send(result);
}

export function SendRegionUserInDetailMultiple(socket: IGameSocket, sessions: number[]) {
  let result = [0x16, 0, 0];

  let userCount = 0;
  for (let session of sessions) {
    let userSocket = RSessionMap[session];
    if (!userSocket) continue;
    if (userCount > 1000) continue; // don't send over 1000 data

    userCount++;

    result.push(0);
    result.push(...short(session));
    result.push(...BuildUserDetail(userSocket));
  }

  result[1] = userCount & 0xFF;
  result[2] = userCount >>> 8;

  socket.send(result);
}

export function SendRegionNpcOut(socket: IGameSocket, uuid: number) {
  if (!socket) return;

  if (socket.visibleNPCs[uuid]) {
    delete socket.visibleNPCs[uuid];

    socket.send([
      0x0A, // NPC_IN_OUT
      2, // OUT
      ...short(uuid)
    ]);
  }
}

export function SendRegionNpcIn(socket: IGameSocket, npc: INPCInstance) {
  if (!socket) return;

  let uuid = npc.uuid;

  if (!socket.visibleNPCs[uuid]) {
    socket.visibleNPCs[uuid] = true;

    socket.send([
      0x0A, // NPC_IN_OUT
      1, // IN
      ...short(npc.uuid),
      ...BuildNPCDetail(npc)
    ]);
  }
}

export enum RegionInCase {
  NORMAL = 1,
  SPAWN = 3,
  WARP = 4
}

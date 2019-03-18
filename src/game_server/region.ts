import { IGameSocket } from "./game_socket";
import { INPCInstance } from "./ai_system/declare";
import { OnUserExit } from "./events/onUserExit";
import { OnRegionUpdate } from "./events/onRegionUpdate";

export const RRegionMap: IRegionDictionary = {};
export const RUserMap: IUserDictionary = {};
export const RZoneMap: IZoneDictionary = {};
export const RSessionMap: ISessionDictionary = {};
export const RNPCRegionMap: INPCRegionDictionary = {};
export const RNPCMap: INPCDictionary = {};

/**
 * Creates or Updates user region object. This function has to be called when user move / spawn / teleport..
 * 
 * @param socket User
 * @param disableEvent Should I disable "OnRegionUpdate" event before be fired? default: false
 */
export function RegionUpdate(socket: IGameSocket, disableEvent = false): boolean {
  let c = socket.character;
  if (!c) return false;
  let x = c.x / 35 >> 0;
  let z = c.z / 35 >> 0;
  let s = `${c.zone}x${x}z${z}`;

  let userRegionObj = RUserMap[c.name];
  if (userRegionObj) {
    if (userRegionObj.s == s) return false;

    RegionRemove(socket, true);
  }

  if (!RRegionMap[s]) {
    RRegionMap[s] = [];
  }

  if (!RZoneMap[c.zone]) {
    RZoneMap[c.zone] = [];
  }

  RRegionMap[s].push(socket);
  RZoneMap[c.zone].push(socket);
  if (userRegionObj) {
    userRegionObj.s = s;
    userRegionObj.zone = c.zone;
    userRegionObj.x = x;
    userRegionObj.z = z;
  } else {
    RUserMap[c.name] = <IRegionUser>{ s, zone: c.zone, x, z, socket };
  }
  RSessionMap[socket.session] = socket;

  if (!disableEvent) {
    OnRegionUpdate(socket);
  }
  return true;
}


export function RegionUpdateNPC(npc: INPCInstance) {
  let x = npc.x / 35 >> 0;
  let z = npc.z / 35 >> 0;
  let s = `${npc.zone}x${x}z${z}`;

  let npcRegionObj = RNPCMap[npc.uuid];
  if (npcRegionObj) {
    if (npcRegionObj.s == s) return false; // no need to update

    RegionRemoveNPC(npc, true);
  }

  if (!RNPCRegionMap[s]) {
    RNPCRegionMap[s] = [];
  }

  RNPCRegionMap[s].push(npc);
  if (npcRegionObj) {
    npcRegionObj.s = s;
    npcRegionObj.zone = npc.zone;
    npcRegionObj.x = x;
    npcRegionObj.z = z;
  } else {
    RNPCMap[npc.uuid] = <IRegionNPC>{ s, zone: npc.zone, x, z, npc };
  }
  return true;
}



/**
 * Removes user from region system. Soft delete wont remove the region instances, that way we prevent unnecessary memory allocations.
 * 
 * @param socket User
 * @param softDelete Should I keep the region instance? default: false
 */
export function RegionRemove(socket: IGameSocket, softDelete = false) {
  let c = socket.character;
  if (!c) return;
  delete RSessionMap[socket.session];

  let us = RUserMap[c.name];

  if (us) {
    if (!softDelete) {
      delete RUserMap[c.name];
    }

    let userRegion = RRegionMap[us.s];
    let userRegionIndex = userRegion.findIndex(x => x == socket);
    userRegion.splice(userRegionIndex, 1); 
    
    // We won't check list for being empty. It will be constant alloc/realloc that we won't "really" need.

    let userZone = RZoneMap[us.zone];
    let userZoneIndex = userZone.findIndex(x => x == socket);
    userZone.splice(userZoneIndex, 1);
  }
}

export function RegionRemoveNPC(npc: INPCInstance, softDelete = false) {
  let n = RNPCMap[npc.uuid];

  if (n) {
    if (!softDelete) {
      delete RNPCMap[npc.uuid];
    }

    let region = RNPCRegionMap[n.s];
    let index = region.findIndex(x => x == npc);
    region.splice(index, 1);

    if (region.length == 0) {
      delete RNPCRegionMap[n.s];
    }
  }
}

export function* RegionQuery(socket) {
  let c = socket.character;
  let s = RUserMap[c.name];
  if (!s) return;

  let fix = s.zone + 'x';
  let cx = s.x;
  let cz = s.z;

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      let s = `${fix}${cx + x}z${cz + y}`;
      if (RRegionMap[s]) {
        yield* RRegionMap[s];
      }
    }
  }
}

export function* RegionAllQuery() {
  for (let key in RUserMap) {
    yield RUserMap[key].socket;
  }
}

export function* RegionZoneQuery(socket: IGameSocket) {
  let c = socket.character;
  let s = RUserMap[c.name];
  if (!s) return;

  yield* RZoneMap[s.zone];
}

export function* RegionQueryNPC(socket: IGameSocket) {
  let c = socket.character;
  let s = RUserMap[c.name];
  if (!s) return;

  let fix = s.zone + 'x';
  let cx = s.x;
  let cz = s.z;

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      let s = `${fix}${cx + x}z${cz + y}`;
      if (RNPCRegionMap[s]) {
        yield* RNPCRegionMap[s];
      }
    }
  }
}

export function* RegionQueryUsersByNpc(instance: INPCInstance) {
  let fix = instance.zone + 'x';
  let cx = instance.x / 35 >> 0;
  let cz = instance.z / 35 >> 0;

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      let s = `${fix}${cx + x}z${cz + y}`;
      if (RRegionMap[s]) {
        yield* RRegionMap[s];
      }
    }
  }
}

/**
 * Sends data to near players of the player.
 * 
 * @param socket Which player is in the center
 * @param packet Data
 */
export function RegionSend(socket: IGameSocket, packet: number[]): void {
  for (let s of RegionQuery(socket)) {
    s.send(packet);
  }
}


/**
 * Sends data to near players of the npc
 * @param npc Which npc is in the center
 * @param packet Data
 */
export function RegionSendByNpc(npc: INPCInstance, packet: number[]): void {
  for (let s of RegionQueryUsersByNpc(npc)) {
    s.send(packet);
  }
}


/**
 * Sends data to zone of the player
 * @param socket Which player's zone will be used
 * @param packet Data
 */
export function ZoneSend(socket: IGameSocket, packet: number[]): void {
  for (let s of RegionZoneQuery(socket)) {
    s.send(packet);
  }
}

/**
 * Sends data to all players which in the map (not the ones; connected but not joined)
 * 
 * @param packet Data
 */
export function AllSend(packet: number[]): void {
  for (let s of RegionAllQuery()) {
    s.send(packet);
  }
}


/**
 * Session storage map. 
 * session(number)->socket(IGameSocket)
 */
export interface ISessionDictionary {
  [session: number]: IGameSocket
}


/**
 * Region user storage map
 * playerName(string)->regionUser(IRegionUser)
 */
export interface IUserDictionary {
  [user: string]: IRegionUser
}


export interface INPCDictionary {
  [npcUUID: number]: IRegionNPC
}

export interface IZoneDictionary {
  [zone: number]: IGameSocket[]
}

export interface IRegionDictionary {
  [regionId: string]: IGameSocket[]
}

export interface INPCRegionDictionary {
  [regionId: string]: INPCInstance[]
}

export interface IRegionUser {
  /** Region id */
  s: string

  /** Zone id */
  zone: number

  /** Region x */
  x: number

  /** Region z */
  z: number

  /** Game socket */
  socket: IGameSocket
}

export interface IRegionNPC {
  /** Region id */
  s: string

  /** Zone id */
  zone: number

  /** Region x */
  x: number

  /** Region z */
  z: number

  /** NPC instance */
  npc: INPCInstance
}